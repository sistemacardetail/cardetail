package br.com.cardetail.dto.seguranca;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetarSenhaDTO(
    @NotBlank(message = "A nova senha é obrigatória!")
    @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres!")
    String novaSenha
) {}
