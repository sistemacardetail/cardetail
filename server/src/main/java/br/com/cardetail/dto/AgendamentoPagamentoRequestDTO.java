package br.com.cardetail.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.cardetail.enums.FormaPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AgendamentoPagamentoRequestDTO(
    @NotNull(message = "O valor pago é obrigatório!")
    @Positive(message = "O valor pago deve ser maior que zero!")
    BigDecimal valorPago,

    @NotNull(message = "A data de recebimento é obrigatória!")
    LocalDate dataRecebimento,

    @NotNull(message = "A forma de pagamento é obrigatória!")
    FormaPagamento formaPagamento,

    String observacao
) {
}
