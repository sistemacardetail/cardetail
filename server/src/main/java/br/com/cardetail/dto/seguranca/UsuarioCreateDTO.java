package br.com.cardetail.dto.seguranca;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioCreateDTO(
    @NotBlank(message = "O login é obrigatório!")
    @Size(max = 50, message = "O login deve ter no máximo 50 caracteres!")
    String login,

    @NotBlank(message = "O nome é obrigatório!")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres!")
    String nome,

    @NotBlank(message = "A senha é obrigatória!")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres!")
    String senha,

    @NotNull(message = "O perfil é obrigatório!")
    Long perfilId,

    boolean ativo
) {
    public UsuarioCreateDTO {
        if (!ativo) {
            ativo = true;
        }
    }
}
