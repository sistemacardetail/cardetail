package br.com.cardetail.dto;

import java.util.UUID;

public record ClienteAutocompleteDTO(
        UUID id,
        String nome,
        String telefonePrincipal,
        String observacao
) {
}
