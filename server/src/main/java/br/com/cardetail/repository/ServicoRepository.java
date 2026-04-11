package br.com.cardetail.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.Servico;
import br.com.cardetail.domain.TipoVeiculo;

@Repository
public interface ServicoRepository extends BaseRepository<Servico, UUID> {

    @Query("""
        SELECT DISTINCT t
        FROM Servico s
        JOIN s.tiposVeiculos tv
        JOIN tv.tipo t
        WHERE s.nome ILIKE :nome
        AND t.id IN (:idsTiposVeiculos)
        AND (:idServico IS NULL OR s.id <> :idServico)
    """)
    List<TipoVeiculo> getTiposServicosRepetidos(@Param("idServico") UUID idServico,
            @Param("nome") String nome,
            @Param("idsTiposVeiculos") Set<UUID> idsTiposVeiculos);

    @Query("""
        SELECT s.nome
        FROM Servico s
        WHERE s.id IN (:ids)
        AND s.ativo = FALSE
    """)
    List<String> getNomesInativosByIds(@Param("ids") Set<UUID> ids);

    @Query("""
        SELECT DISTINCT s
        FROM Servico s
        JOIN s.tiposVeiculos tv
        JOIN tv.tipo t
        WHERE t.id = :idTipoVeiculo
        AND s.ativo = TRUE
        AND s.disponivelPacote = TRUE
        ORDER BY s.nome
    """)
    List<Servico> getServicosPacote(@Param("idTipoVeiculo") UUID idTipoVeiculo);

    @Query("""
        SELECT DISTINCT s
        FROM Servico s
        JOIN s.tiposVeiculos tv
        JOIN tv.tipo t
        WHERE t.id = :idTipoVeiculo
        AND s.ativo = TRUE
        AND s.disponivelAgendamento = TRUE
        AND (:idsExcludeEmpty = TRUE OR s.id NOT IN (:idsExclude))
        ORDER BY s.nome
    """)
    List<Servico> getServicosAgendamento(
            @Param("idTipoVeiculo") UUID idTipoVeiculo,
            @Param("idsExclude") Set<UUID> idsExclude,
            @Param("idsExcludeEmpty") boolean idsExcludeEmpty);
}
