package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

@Component
public class CnpjValidator {

    public boolean isValido(String cnpj) {
        if (cnpj == null) return false;

        // Remove caracteres não numéricos
        String cnpjNumeros = cnpj.replaceAll("\\D", "");

        if (cnpjNumeros.length() != 14) return false;

        // Verifica se todos os dígitos são iguais
        if (cnpjNumeros.matches("(\\d)\\1{13}")) return false;

        // Calcula primeiro dígito verificador
        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(cnpjNumeros.charAt(i)) * pesos1[i];
        }
        int resto = soma % 11;
        int digito1 = resto < 2 ? 0 : 11 - resto;

        if (Character.getNumericValue(cnpjNumeros.charAt(12)) != digito1) {
            return false;
        }

        // Calcula segundo dígito verificador
        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(cnpjNumeros.charAt(i)) * pesos2[i];
        }
        resto = soma % 11;
        int digito2 = resto < 2 ? 0 : 11 - resto;

        return Character.getNumericValue(cnpjNumeros.charAt(13)) == digito2;
    }

    public String limpar(String cnpj) {
        if (cnpj == null) return null;
        return cnpj.replaceAll("\\D", "");
    }
}
