package br.com.cardetail.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum CrudOperation {
    SAVE("salvar"),
    UPDATE("atualizar"),
    DELETE("deletar");

    private final String description;
}
