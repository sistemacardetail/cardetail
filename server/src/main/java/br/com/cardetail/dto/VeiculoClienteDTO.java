package br.com.cardetail.dto;

public record VeiculoClienteDTO(
        String id,
        String clienteId,
        String clienteNome,
        String clienteObservacao,
        String clienteTelefone,
        String modelo,
        String marca,
        String cor,
        String placa,
        String tipo,
        String idTipo,
        String observacao
) {
}