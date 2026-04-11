package br.com.cardetail.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.cardetail.config.security.SecurityContext;
import br.com.cardetail.domain.Usuario;
import br.com.cardetail.domain.security.Perfil;
import br.com.cardetail.domain.security.Permissao;
import br.com.cardetail.dto.seguranca.AlterarSenhaDTO;
import br.com.cardetail.dto.seguranca.UsuarioCreateDTO;
import br.com.cardetail.dto.seguranca.UsuarioDTO;
import br.com.cardetail.dto.seguranca.UsuarioDTO.PerfilResumoDTO;
import br.com.cardetail.dto.seguranca.UsuarioUpdateDTO;
import br.com.cardetail.repository.PerfilRepository;
import br.com.cardetail.repository.UsuarioRepository;
import br.com.cardetail.validator.SenhaValidator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository repository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final SenhaValidator senhaValidator;
    private final SecurityContext securityContext;
    private final AuditoriaService auditoriaService;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Usuario usuario = repository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado!"));

        if (!usuario.isAtivo()) {
            throw new UsernameNotFoundException("Usuário inativo!");
        }

        if (usuario.isBloqueado()) {
            throw new UsernameNotFoundException("Usuário bloqueado temporariamente!");
        }

        Set<String> permissoes = usuario.getPerfil().getPermissoes()
            .stream()
            .map(Permissao::getCodigo)
            .collect(Collectors.toSet());

        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getLogin())
                .password(usuario.getSenha())
                .authorities(permissoes.stream()
                    .map(p -> "PERMISSION_" + p)
                    .toArray(String[]::new))
                .build();
    }

    public List<UsuarioDTO> listarTodos() {
        return repository.findByAdminFalse().stream()
            .map(this::toDTO)
            .toList();
    }

    public List<UsuarioDTO> listarAtivos() {
        return repository.findByAtivoTrueAndAdminFalse().stream()
            .map(this::toDTO)
            .toList();
    }

    public UsuarioDTO buscarPorId(UUID id) {
        return repository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    public List<UsuarioDTO> buscar(String nome) {
        return repository.findByNomeLike(nome).stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional
    public UsuarioDTO criar(UsuarioCreateDTO dto) {
        validarLoginUnico(dto.login(), null);
        validarSenha(dto.senha());

        Perfil perfil = buscarPerfil(dto.perfilId());

        Usuario usuario = new Usuario();
        usuario.setLogin(dto.login());
        usuario.setNome(dto.nome());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setPerfil(perfil);
        usuario.setAtivo(dto.ativo());

        usuario = repository.save(usuario);

        auditoriaService.registrarCriacao("Usuario", usuario.getId());

        return toDTO(usuario);
    }

    @Transactional
    public UsuarioDTO atualizar(UUID id, UsuarioUpdateDTO dto) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        validarLoginUnico(dto.login(), id);

        if (isUltimoAdministradorAtivo(usuario) && (!dto.ativo() || !isPerfilAdministrador(dto.perfilId()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível desativar ou alterar o perfil do último administrador ativo");
        }

        Perfil perfil = buscarPerfil(dto.perfilId());

        usuario.setLogin(dto.login());
        usuario.setNome(dto.nome());
        usuario.setPerfil(perfil);
        usuario.setAtivo(dto.ativo());

        usuario = repository.save(usuario);

        auditoriaService.registrarAtualizacao("Usuario", usuario.getId());

        return toDTO(usuario);
    }

    @Transactional
    public void alterarSenha(UUID usuarioId, AlterarSenhaDTO dto) {
        Usuario usuario = repository.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        if (!dto.senhasConferem()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas não conferem");
        }

        validarSenha(dto.novaSenha());

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));

        repository.save(usuario);

        auditoriaService.registrarAlteracaoSenha(usuario.getId());
    }

    @Transactional
    public void resetarSenha(UUID usuarioId, String novaSenha) {
        Usuario usuario = repository.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        validarSenha(novaSenha);

        usuario.setSenha(passwordEncoder.encode(novaSenha));

        repository.save(usuario);

        auditoriaService.registrarAlteracaoSenha(usuario.getId());
    }

    @Transactional
    public void excluir(UUID id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        // Não permitir excluir o próprio usuário
        if (id.equals(securityContext.getUsuarioIdLogado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir seu próprio usuário");
        }

        // Não permitir excluir o último administrador
        if (isUltimoAdministradorAtivo(usuario)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível excluir o último administrador ativo");
        }

        repository.delete(usuario);

        auditoriaService.registrarExclusao("Usuario", id);
    }

    @Transactional
    public void ativar(UUID id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        usuario.setAtivo(true);

        repository.save(usuario);
    }

    @Transactional
    public void desativar(UUID id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        // Não permitir desativar o próprio usuário
        if (id.equals(securityContext.getUsuarioIdLogado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível desativar seu próprio usuário");
        }

        // Não permitir desativar o último administrador
        if (isUltimoAdministradorAtivo(usuario)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível desativar o último administrador ativo");
        }

        usuario.setAtivo(false);

        repository.save(usuario);
    }

    @Transactional
    public void desbloquear(UUID id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        usuario.resetAttrmptsLogin();

        repository.save(usuario);
    }

    private void validarLoginUnico(String login, UUID idIgnorar) {
        boolean existe = idIgnorar == null
            ? repository.existsByLogin(login)
            : repository.existsByLoginAndIdNot(login, idIgnorar);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login de usuário já cadastrado");
        }
    }

    private void validarSenha(String senha) {
        var resultado = senhaValidator.validar(senha);
        if (!resultado.isValida()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, resultado.getErrosFormatados());
        }
    }

    private Perfil buscarPerfil(Long perfilId) {
        return perfilRepository.findById(perfilId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Perfil não encontrado"));
    }

    private boolean isUltimoAdministradorAtivo(Usuario usuario) {
        if (!usuario.getPerfil().isAdministrador() || !usuario.isAtivo()) {
            return false;
        }
        return repository.countAdministradoresAtivos() <= 1;
    }

    private boolean isPerfilAdministrador(Long perfilId) {
        return perfilRepository.findById(perfilId)
            .map(Perfil::isAdministrador)
            .orElse(false);
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        Set<String> permissoes = usuario.getPerfil().getPermissoes()
            .stream()
            .map(Permissao::getCodigo)
            .collect(Collectors.toSet());

        return new UsuarioDTO(
            usuario.getId(),
            usuario.getLogin(),
            usuario.getNome(),
            new PerfilResumoDTO(
                usuario.getPerfil().getId(),
                usuario.getPerfil().getNome(),
                usuario.getPerfil().getNivel()
            ),
            usuario.isAtivo(),
            usuario.isAdmin(),
            usuario.getLastLogin(),
            permissoes
        );
    }
}
