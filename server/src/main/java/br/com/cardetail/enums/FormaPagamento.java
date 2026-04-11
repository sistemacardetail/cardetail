package br.com.cardetail.enums;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum FormaPagamento {
    DINHEIRO(1, "Dinheiro"),
    CARTAO_CREDITO(2, "Cartão de Crédito"),
    CARTAO_DEBITO(3, "Cartão de Débito"),
    PIX(4, "PIX"),
    TRANSFERENCIA(5, "Transferência"),
    PERMUTA(6, "Permuta");

    private final int id;
    private final String descricao;

    public static FormaPagamento fromId(int id) {
        return Arrays.stream(values())
                .filter(forma -> forma.id == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Forma de pagamento não encontrada: " + id));
    }
}
