package br.com.cardetail.dto;

import java.util.List;

public record ClienteDTO(
        String id,
        String nome,
        String status,
        String telefonePrincipal,
        String observacao,
        List<VeiculoDTO> veiculos) {
}
