package br.com.cardetail.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.cardetail.config.security.SecurityContext;
import br.com.cardetail.domain.security.Perfil;
import br.com.cardetail.domain.security.Permissao;
import br.com.cardetail.dto.seguranca.PerfilCreateDTO;
import br.com.cardetail.dto.seguranca.PerfilDTO;
import br.com.cardetail.dto.seguranca.PermissaoDTO;
import br.com.cardetail.enums.PerfilPadrao;
import br.com.cardetail.repository.PerfilRepository;
import br.com.cardetail.repository.PermissaoRepository;
import br.com.cardetail.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final PerfilRepository repository;
    private final PermissaoRepository permissaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContext securityContext;
    private final AuditoriaService auditoriaService;

    public List<PerfilDTO> listarTodos() {
        return repository.findAllByOrderByNivelAsc().stream()
            .map(this::toDTO)
            .toList();
    }

    public List<PerfilDTO> listarAtivos() {
        return repository.findByAtivoTrueOrderByNivelAsc().stream()
            .map(this::toDTO)
            .toList();
    }

    public PerfilDTO buscarPorId(Long id) {
        return repository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado"));
    }

    @Transactional
    public PerfilDTO criar(PerfilCreateDTO dto) {
        validarNomeUnico(dto.nome(), null);

        Perfil perfil = new Perfil();
        perfil.setNome(dto.nome());
        perfil.setDescricao(dto.descricao());
        perfil.setNivel(dto.nivel());
        perfil.setAtivo(dto.ativo());
        perfil.setCreatedBy(securityContext.getUsuarioIdLogado());

        if (dto.permissoesIds() != null && !dto.permissoesIds().isEmpty()) {
            Set<Permissao> permissoes = new HashSet<>(permissaoRepository.findAllById(dto.permissoesIds()));
            perfil.setPermissoes(permissoes);
        }

        perfil = repository.save(perfil);

        return toDTO(perfil);
    }

    @Transactional
    public PerfilDTO atualizar(Long id, PerfilCreateDTO dto) {
        Perfil perfil = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado"));

        validarNomeUnico(dto.nome(), id);
        validarAlteracaoPerfilPadrao(perfil, dto);

        perfil.setNome(dto.nome());
        perfil.setDescricao(dto.descricao());
        perfil.setNivel(dto.nivel());
        perfil.setAtivo(dto.ativo());
        perfil.setUpdatedBy(securityContext.getUsuarioIdLogado());

        if (dto.permissoesIds() != null) {
            Set<Permissao> permissoes = new HashSet<>(permissaoRepository.findAllById(dto.permissoesIds()));
            perfil.setPermissoes(permissoes);
        }

        perfil = repository.save(perfil);

        return toDTO(perfil);
    }

    @Transactional
    public void excluir(Long id) {
        Perfil perfil = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado"));

        // Não permitir excluir perfis padrão do sistema
        if (isPerfilPadrao(perfil.getNome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível excluir perfis padrão do sistema");
        }

        // Verificar se há usuários usando este perfil
        if (!usuarioRepository.findByPerfilId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível excluir um perfil que está sendo usado por usuários");
        }

        repository.delete(perfil);
    }

    private void validarNomeUnico(String nome, Long idIgnorar) {
        boolean existe = idIgnorar == null
            ? repository.existsByNome(nome)
            : repository.existsByNomeAndIdNot(nome, idIgnorar);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um perfil com este nome");
        }
    }

    private void validarAlteracaoPerfilPadrao(Perfil perfil, PerfilCreateDTO dto) {
        // Não permitir alterar nome de perfis padrão
        if (isPerfilPadrao(perfil.getNome()) && !perfil.getNome().equals(dto.nome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Não é possível alterar o nome de perfis padrão do sistema");
        }
    }

    private boolean isPerfilPadrao(String nome) {
        return PerfilPadrao.ADMINISTRADOR.getNome().equals(nome) || PerfilPadrao.FUNCIONARIO.getNome().equals(nome);
    }

    private PerfilDTO toDTO(Perfil perfil) {
        Set<PermissaoDTO> permissoes = perfil.getPermissoes().stream()
            .map(p -> new PermissaoDTO(p.getId(), p.getCodigo(), p.getDescricao(), p.getModulo()))
            .collect(Collectors.toSet());

        return new PerfilDTO(
            perfil.getId(),
            perfil.getNome(),
            perfil.getDescricao(),
            perfil.getNivel(),
            perfil.isAtivo(),
            permissoes
        );
    }
}
