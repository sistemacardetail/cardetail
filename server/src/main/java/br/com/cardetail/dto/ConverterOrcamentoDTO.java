package br.com.cardetail.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para conversão de orçamento em agendamento.
 * Contém os dados necessários para criar o agendamento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConverterOrcamentoDTO {

    @NotNull(message = "A data de previsão de início é obrigatória")
    private LocalDateTime dataPrevisaoInicio;

    @NotNull(message = "A data de previsão de fim é obrigatória")
    private LocalDateTime dataPrevisaoFim;

}
