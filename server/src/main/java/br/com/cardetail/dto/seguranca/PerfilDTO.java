package br.com.cardetail.dto.seguranca;

import java.util.Set;

public record PerfilDTO(
    Long id,
    String nome,
    String descricao,
    Integer nivel,
    boolean ativo,
    Set<PermissaoDTO> permissoes
) {}
