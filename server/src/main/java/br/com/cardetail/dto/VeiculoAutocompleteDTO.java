package br.com.cardetail.dto;

import java.util.UUID;

public record VeiculoAutocompleteDTO(
        UUID id,
        String modelo,
        String marca,
        String cor,
        String placa,
        UUID idTipo,
        UUID idCliente,
        String observacao
) {
}
