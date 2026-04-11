package br.com.cardetail.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Configuracao {
    COR_PRIMARIA("COR_PRIMARIA");

    private final String key;
}
