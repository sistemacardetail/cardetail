package br.com.cardetail.resource;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.dto.seguranca.PerfilCreateDTO;
import br.com.cardetail.dto.seguranca.PerfilDTO;
import br.com.cardetail.dto.seguranca.PermissaoDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.PerfilService;
import br.com.cardetail.service.PermissaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/perfis")
@RequiredArgsConstructor
public class PerfilResource {

    private final PerfilService perfilService;
    private final PermissaoService permissaoService;

    @GetMapping
    @RequiresPermission(PermissaoEnum.PERFIS_VISUALIZAR)
    public ResponseEntity<List<PerfilDTO>> listar() {
        return ResponseEntity.ok(perfilService.listarTodos());
    }

    @GetMapping("/ativos")
    @RequiresPermission(PermissaoEnum.PERFIS_VISUALIZAR)
    public ResponseEntity<List<PerfilDTO>> listarAtivos() {
        return ResponseEntity.ok(perfilService.listarAtivos());
    }

    @GetMapping("/{id}")
    @RequiresPermission(PermissaoEnum.PERFIS_VISUALIZAR)
    public ResponseEntity<PerfilDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(perfilService.buscarPorId(id));
    }

    @PostMapping
    @RequiresPermission(PermissaoEnum.PERFIS_CRIAR)
    public ResponseEntity<PerfilDTO> criar(@RequestBody @Valid PerfilCreateDTO dto) {
        PerfilDTO criado = perfilService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    @RequiresPermission(PermissaoEnum.PERFIS_EDITAR)
    public ResponseEntity<PerfilDTO> atualizar(@PathVariable Long id, @RequestBody @Valid PerfilCreateDTO dto) {
        return ResponseEntity.ok(perfilService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(PermissaoEnum.PERFIS_EXCLUIR)
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        perfilService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/permissoes")
    @RequiresPermission({PermissaoEnum.PERFIS_VISUALIZAR, PermissaoEnum.PERFIS_EDITAR, PermissaoEnum.PERFIS_CRIAR})
    public ResponseEntity<List<PermissaoDTO>> listarPermissoes() {
        return ResponseEntity.ok(permissaoService.listarTodas());
    }

    @GetMapping("/permissoes/agrupadas")
    @RequiresPermission({PermissaoEnum.PERFIS_VISUALIZAR, PermissaoEnum.PERFIS_EDITAR, PermissaoEnum.PERFIS_CRIAR})
    public ResponseEntity<Map<String, List<PermissaoDTO>>> listarPermissoesAgrupadas() {
        return ResponseEntity.ok(permissaoService.listarAgrupadasPorModulo());
    }
}
