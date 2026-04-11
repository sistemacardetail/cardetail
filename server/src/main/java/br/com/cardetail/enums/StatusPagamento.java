package br.com.cardetail.enums;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum StatusPagamento {
    PENDENTE(1, "Pendente"),
    PARCIAL(2, "Parcialmente Pago"),
    PAGO(3, "Pago");

    private final int id;
    private final String descricao;

    public static StatusPagamento fromId(int id) {
        return Arrays.stream(values())
                .filter(status -> status.id == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Status de pagamento não encontrado: " + id));
    }
}
