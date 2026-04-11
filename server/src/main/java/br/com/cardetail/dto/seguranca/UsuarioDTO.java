package br.com.cardetail.dto.seguranca;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record UsuarioDTO(
    UUID id,
    String login,
    String nome,
    PerfilResumoDTO perfil,
    boolean ativo,
    boolean admin,
    LocalDateTime lastLogin,
    Set<String> permissoes
) {
    public record PerfilResumoDTO(Long id, String nome, Integer nivel) {}
}
