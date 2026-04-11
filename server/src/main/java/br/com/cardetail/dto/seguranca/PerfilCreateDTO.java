package br.com.cardetail.dto.seguranca;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PerfilCreateDTO(
    @NotBlank(message = "O nome é obrigatório!")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres!")
    String nome,

    @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres!")
    String descricao,

    @NotNull(message = "O nível é obrigatório!")
    Integer nivel,

    boolean ativo,

    Set<Long> permissoesIds
) {
    public PerfilCreateDTO {
        if (ativo == false) {
            ativo = true;
        }
    }
}
