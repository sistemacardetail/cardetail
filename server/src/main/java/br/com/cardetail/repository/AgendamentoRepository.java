package br.com.cardetail.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.Agendamento;

@Repository
public interface AgendamentoRepository extends BaseRepository<Agendamento, UUID> {

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.dataPrevisaoInicio <= :dataFim
        AND a.dataPrevisaoFim >= :dataInicio
        ORDER BY a.dataPrevisaoInicio
    """)
    List<Agendamento> findByPeriodo(
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE DATE(a.dataPrevisaoInicio) = DATE(:data)
        ORDER BY a.dataPrevisaoInicio
    """)
    List<Agendamento> findByDia(@Param("data") LocalDateTime data);

    boolean existsByVeiculoId(UUID idVeiculo);

    boolean existsByVeiculoIdIn(Set<UUID> idsVeiculos);

    boolean existsByPacoteId(UUID idPacote);

    boolean existsByServicosServicoId(UUID idServico);

    boolean existsByServicosTerceirizadosServicoId(UUID idServico);

}
