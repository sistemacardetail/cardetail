package br.com.cardetail.dto;

import java.math.BigDecimal;
import java.util.List;

import br.com.cardetail.enums.StatusPagamento;

public record AgendamentoResumoFinanceiroDTO(
    String agendamentoId,
    Long numero,
    BigDecimal valorTotal,
    BigDecimal valorPagoTotal,
    BigDecimal saldoRestante,
    BigDecimal percentualPago,
    StatusPagamento statusPagamento,
    String statusPagamentoDescricao,
    boolean podeReceberPagamento,
    boolean isEditavel,
    List<AgendamentoPagamentoDTO> pagamentos
) {
}
