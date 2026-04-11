package br.com.cardetail.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum PerfilPadrao {
    ADMINISTRADOR("ADMINISTRADOR"),
    FUNCIONARIO("FUNCIONARIO");

    private final String nome;

    public static boolean isAdministrador(final String nomePerfil) {
        return ADMINISTRADOR.nome.equals(nomePerfil);
    }
}
