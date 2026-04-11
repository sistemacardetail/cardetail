package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

import br.com.cardetail.config.security.annotation.NoRequiresPermission;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.dto.configuracao.EmpresaCreateDTO;
import br.com.cardetail.dto.configuracao.EmpresaDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.EmpresaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaResource {

    private final EmpresaService service;

    @GetMapping
    @RequiresPermission(PermissaoEnum.EMPRESA_VISUALIZAR)
    public ResponseEntity<EmpresaDTO> buscar() {
        EmpresaDTO empresa = service.buscar();
        if (empresa == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(empresa);
    }

    @GetMapping("/nome")
    @NoRequiresPermission
    public ResponseEntity<String> buscarNome() {
        String nome = service.buscarNomeFantasia();
        if (nome == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(nome);
    }

    @GetMapping("/{id}")
    @RequiresPermission(PermissaoEnum.EMPRESA_VISUALIZAR)
    public ResponseEntity<EmpresaDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @RequiresPermission(PermissaoEnum.EMPRESA_EDITAR)
    public ResponseEntity<EmpresaDTO> criar(@RequestBody @Valid EmpresaCreateDTO dto) {
        EmpresaDTO salvo = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping
    @RequiresPermission(PermissaoEnum.EMPRESA_EDITAR)
    public ResponseEntity<EmpresaDTO> atualizar(@RequestBody @Valid EmpresaCreateDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PostMapping("/{id}/logo")
    @RequiresPermission(PermissaoEnum.EMPRESA_EDITAR)
    public ResponseEntity<Void> uploadLogo(@PathVariable UUID id, @RequestParam("arquivo") MultipartFile arquivo) {
        service.uploadLogo(id, arquivo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable UUID id) {
        byte[] logo = service.getLogo(id);
        String contentType = service.getLogoContentType(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"));
        headers.setCacheControl("max-age=86400");

        return new ResponseEntity<>(logo, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}/logo")
    @RequiresPermission(PermissaoEnum.EMPRESA_EDITAR)
    public ResponseEntity<Void> removerLogo(@PathVariable UUID id) {
        service.removerLogo(id);
        return ResponseEntity.noContent().build();
    }
}
