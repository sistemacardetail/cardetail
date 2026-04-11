package br.com.cardetail.enums;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatusAgendamento {
    CONFIRMADO(1),
    EM_ANDAMENTO(2),
    CONCLUIDO(3),
    CANCELADO(4);

    private final int id;

    public static StatusAgendamento fromId(int id) {
        return Arrays.stream(values())
                .filter(status -> status.id == id)
                .findFirst()
                .orElseThrow();
    }
}
