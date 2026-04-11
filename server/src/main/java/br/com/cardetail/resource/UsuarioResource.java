package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.SecurityContext;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.dto.seguranca.AlterarSenhaDTO;
import br.com.cardetail.dto.seguranca.ResetarSenhaDTO;
import br.com.cardetail.dto.seguranca.UsuarioCreateDTO;
import br.com.cardetail.dto.seguranca.UsuarioDTO;
import br.com.cardetail.dto.seguranca.UsuarioUpdateDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioResource {

    private final UsuarioService service;
    private final SecurityContext securityContext;

    @GetMapping
    @RequiresPermission(PermissaoEnum.USUARIOS_VISUALIZAR)
    public ResponseEntity<List<UsuarioDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/ativos")
    @RequiresPermission(PermissaoEnum.USUARIOS_VISUALIZAR)
    public ResponseEntity<List<UsuarioDTO>> listarAtivos() {
        return ResponseEntity.ok(service.listarAtivos());
    }

    @GetMapping("/{id}")
    @RequiresPermission(PermissaoEnum.USUARIOS_VISUALIZAR)
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/buscar")
    @RequiresPermission(PermissaoEnum.USUARIOS_VISUALIZAR)
    public ResponseEntity<List<UsuarioDTO>> buscar(@RequestParam String nome) {
        return ResponseEntity.ok(service.buscar(nome));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioLogado() {
        UUID usuarioId = securityContext.getUsuarioIdLogado();
        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.buscarPorId(usuarioId));
    }

    @PostMapping
    @RequiresPermission(PermissaoEnum.USUARIOS_CRIAR)
    public ResponseEntity<UsuarioDTO> criar(@RequestBody @Valid UsuarioCreateDTO dto) {
        UsuarioDTO criado = service.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<UsuarioDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(PermissaoEnum.USUARIOS_EXCLUIR)
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ativar")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<Void> ativar(@PathVariable UUID id) {
        service.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/desativar")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<Void> desativar(@PathVariable UUID id) {
        service.desativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/desbloquear")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<Void> desbloquear(@PathVariable UUID id) {
        service.desbloquear(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resetar-senha")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<Void> resetarSenha(@PathVariable UUID id, @RequestBody @Valid ResetarSenhaDTO dto) {
        service.resetarSenha(id, dto.novaSenha());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/alterar-senha")
    @RequiresPermission(PermissaoEnum.USUARIOS_EDITAR)
    public ResponseEntity<Void> alterarSenha(@RequestBody @Valid AlterarSenhaDTO dto) {
        UUID usuarioId = securityContext.getUsuarioIdLogado();
        if (usuarioId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        service.alterarSenha(usuarioId, dto);
        return ResponseEntity.noContent().build();
    }
}
