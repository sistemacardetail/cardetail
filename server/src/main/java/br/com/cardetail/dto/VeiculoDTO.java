package br.com.cardetail.dto;

public record VeiculoDTO(
        String id,
        String modelo,
        String cor,
        String marca,
        String tipo,
        String placa,
        String observacao) {
}