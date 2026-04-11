package br.com.cardetail.dto;

public record ProdutoAutomotivoDTO(
        String id,
        String nome,
        String descricao,
        String marca,
        String unidade,
        String tamanho,
        String tipo) {
}