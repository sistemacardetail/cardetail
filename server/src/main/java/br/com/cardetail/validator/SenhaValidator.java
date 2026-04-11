package br.com.cardetail.validator;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class SenhaValidator {

    private static final int TAMANHO_MINIMO = 8;
    private static final Pattern MAIUSCULA = Pattern.compile("[A-Z]");
    private static final Pattern MINUSCULA = Pattern.compile("[a-z]");
    private static final Pattern NUMERO = Pattern.compile("[0-9]");
    private static final Pattern ESPECIAL = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");

    public ValidationResult validar(String senha) {
        List<String> erros = new ArrayList<>();

        if (senha == null || senha.isBlank()) {
            erros.add("A senha é obrigatória");
            return new ValidationResult(false, erros);
        }

        if (senha.length() < TAMANHO_MINIMO) {
            erros.add("A senha deve ter no mínimo " + TAMANHO_MINIMO + " caracteres");
        }

        if (!MAIUSCULA.matcher(senha).find()) {
            erros.add("A senha deve conter pelo menos uma letra maiúscula");
        }

        if (!MINUSCULA.matcher(senha).find()) {
            erros.add("A senha deve conter pelo menos uma letra minúscula");
        }

        if (!NUMERO.matcher(senha).find()) {
            erros.add("A senha deve conter pelo menos um número");
        }

        if (!ESPECIAL.matcher(senha).find()) {
            erros.add("A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?\":{}|<>)");
        }

        return new ValidationResult(erros.isEmpty(), erros);
    }

    public boolean isValida(String senha) {
        return validar(senha).isValida();
    }

    public record ValidationResult(boolean isValida, List<String> erros) {
        public String getErrosFormatados() {
            return String.join("; ", erros);
        }
    }
}
