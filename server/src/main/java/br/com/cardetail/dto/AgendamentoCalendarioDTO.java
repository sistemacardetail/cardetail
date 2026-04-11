package br.com.cardetail.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoCalendarioDTO {

    private UUID id;
    private Long numero;
    private UUID clienteId;
    private String clienteNome;
    private UUID veiculoId;
    private String veiculoModelo;
    private String veiculoPlaca;
    private String veiculoCor;
    private UUID pacoteId;
    private String pacoteNome;
    private String titulo;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String status;
    private BigDecimal valorFinal;
    private String observacao;
    @Builder.Default
    private List<String> servicosNome = new ArrayList<>();

}
