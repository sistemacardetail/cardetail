package br.com.cardetail.resource;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.Orcamento;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.enums.StatusOrcamento;
import br.com.cardetail.service.OrcamentoPdfService;
import br.com.cardetail.service.OrcamentoService;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.ORCAMENTOS_VISUALIZAR,
        criar = PermissaoEnum.ORCAMENTOS_CRIAR,
        atualizar = PermissaoEnum.ORCAMENTOS_EDITAR,
        remover = PermissaoEnum.ORCAMENTOS_EXCLUIR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoResource extends BaseResource<Orcamento, UUID> {

    private final OrcamentoPdfService pdfService;
    private final OrcamentoService service;

    @PatchMapping("/{id}/status")
    @RequiresPermission(PermissaoEnum.ORCAMENTOS_EDITAR)
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String statusStr = body.get("status");
        StatusOrcamento status = StatusOrcamento.valueOf(statusStr);

        service.updateStatus(id, status);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancelar")
    @RequiresPermission(PermissaoEnum.ORCAMENTOS_EDITAR)
    public ResponseEntity<Void> cancelar(@PathVariable UUID id) {
        service.updateStatus(id, StatusOrcamento.CANCELADO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/pdf")
    @RequiresPermission(PermissaoEnum.ORCAMENTOS_VISUALIZAR)
    public ResponseEntity<byte[]> gerarPdf(@PathVariable UUID id) {
        Orcamento orcamento = service.findOne(id);
        if (orcamento == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdfBytes = pdfService.gerarPdf(orcamento);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                "orcamento-" + orcamento.getNumero() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

}
