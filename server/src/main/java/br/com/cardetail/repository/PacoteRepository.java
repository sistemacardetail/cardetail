package br.com.cardetail.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.Pacote;

@Repository
public interface PacoteRepository extends BaseRepository<Pacote, UUID> {

    boolean existsByServicosServicoId(UUID servicoId);

    boolean existsByServicosServicoIdAndAtivoIsTrue(UUID servicoId);

    @Query("""
        SELECT COUNT(1) > 0
        FROM Pacote p
        WHERE p.nome ILIKE :nome
        AND p.tipoVeiculo.id = :idTipoVeiculo
        AND p.ativo IS TRUE
        AND (:idPacote IS NULL OR p.id <> :idPacote)
    """)
    boolean isNomeRepetido(@Param("idPacote") UUID idPacote, @Param("nome") String nome, @Param("idTipoVeiculo") UUID idTipoVeiculo);

    @Query("""
        SELECT ps.servico.id
        FROM Pacote p
        JOIN p.servicos ps
        WHERE p.id = :idPacote
    """)
    Set<UUID> getIdsServicosPacote(@Param("idPacote") UUID idPacote);

    @Query("""
        SELECT p
        FROM Pacote p
        JOIN p.tipoVeiculo t
        WHERE t.id = :idTipoVeiculo
        AND p.ativo = TRUE
        ORDER BY p.nome
    """)
    List<Pacote> getPacotesAgendamento(@Param("idTipoVeiculo") UUID idTipoVeiculo);

}
