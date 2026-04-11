package br.com.cardetail.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import br.com.cardetail.enums.FormaPagamento;

public record AgendamentoPagamentoDTO(
    String id,
    BigDecimal valorPago,
    LocalDate dataRecebimento,
    FormaPagamento formaPagamento,
    String formaPagamentoDescricao,
    String observacao,
    LocalDateTime dataCriacao
) {
}
