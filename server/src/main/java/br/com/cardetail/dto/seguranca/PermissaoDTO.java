package br.com.cardetail.dto.seguranca;

public record PermissaoDTO(
    Long id,
    String codigo,
    String descricao,
    String modulo
) {}
