package br.com.cardetail.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO (
        @NotBlank(message = "Obrigatório preencher o usuário!") String username,
        @NotBlank(message = "Obrigatório preencher a senha!") String password) {
}
