package br.com.cardetail.dto.seguranca;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(
    @NotBlank(message = "A senha atual é obrigatória!")
    String senhaAtual,

    @NotBlank(message = "A nova senha é obrigatória!")
    @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres!")
    String novaSenha,

    @NotBlank(message = "A confirmação de senha é obrigatória!")
    String confirmarSenha
) {
    public boolean senhasConferem() {
        return novaSenha != null && novaSenha.equals(confirmarSenha);
    }
}
