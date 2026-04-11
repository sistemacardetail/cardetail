package br.com.cardetail.dto.seguranca;

import java.util.Set;
import java.util.UUID;

public record LoginResponseDTO(
    UUID id,
    String login,
    String nome,
    String perfil,
    Set<String> permissoes
) {}
