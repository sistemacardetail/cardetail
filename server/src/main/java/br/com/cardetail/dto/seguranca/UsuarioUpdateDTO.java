package br.com.cardetail.dto.seguranca;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(
    @NotBlank(message = "O login é obrigatório!")
    @Size(max = 50, message = "O login deve ter no máximo 50 caracteres!")
    String login,

    @NotBlank(message = "O nome é obrigatório!")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres!")
    String nome,

    @NotNull(message = "O perfil é obrigatório!")
    Long perfilId,

    boolean ativo
) {}
