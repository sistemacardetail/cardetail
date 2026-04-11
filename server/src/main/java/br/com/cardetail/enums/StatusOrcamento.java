package br.com.cardetail.enums;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatusOrcamento {
    PENDENTE(1),
    AGENDADO(2),
    CANCELADO(3);

    private final int id;

    public static StatusOrcamento fromId(int id) {
        return Arrays.stream(values())
                .filter(status -> status.id == id)
                .findFirst()
                .orElseThrow();
    }
}
