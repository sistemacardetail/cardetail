package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.dto.AgendamentoPagamentoDTO;
import br.com.cardetail.dto.AgendamentoPagamentoRequestDTO;
import br.com.cardetail.dto.AgendamentoResumoFinanceiroDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.AgendamentoPagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/agendamentos/{agendamentoId}/pagamentos")
public class AgendamentoPagamentoResource {

    private final AgendamentoPagamentoService service;

    @GetMapping("/resumo")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR)
    public ResponseEntity<AgendamentoResumoFinanceiroDTO> getResumoFinanceiro(
            @PathVariable UUID agendamentoId) {
        AgendamentoResumoFinanceiroDTO resumo = service.getResumoFinanceiro(agendamentoId);
        return ResponseEntity.ok(resumo);
    }

    @GetMapping
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR)
    public ResponseEntity<List<AgendamentoPagamentoDTO>> listarPagamentos(
            @PathVariable UUID agendamentoId) {
        List<AgendamentoPagamentoDTO> pagamentos = service.listarPagamentos(agendamentoId);
        return ResponseEntity.ok(pagamentos);
    }

    @PostMapping
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_PAGAMENTOS_CRIAR)
    public ResponseEntity<AgendamentoPagamentoDTO> adicionarPagamento(
            @PathVariable UUID agendamentoId,
            @RequestBody @Valid AgendamentoPagamentoRequestDTO request) {
        AgendamentoPagamentoDTO pagamento = service.adicionarPagamento(agendamentoId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pagamento);
    }

    @DeleteMapping("/{pagamentoId}")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_PAGAMENTOS_EXCLUIR)
    public ResponseEntity<Void> removerPagamento(
            @PathVariable UUID agendamentoId,
            @PathVariable UUID pagamentoId) {
        service.removerPagamento(agendamentoId, pagamentoId);
        return ResponseEntity.noContent().build();
    }
}
