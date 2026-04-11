package br.com.cardetail.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.AgendamentoPagamento;

@Repository
public interface AgendamentoPagamentoRepository extends BaseRepository<AgendamentoPagamento, UUID> {

    List<AgendamentoPagamento> findByIdAgendamentoOrderByDataRecebimentoDesc(UUID idAgendamento);

    @Query("""
        SELECT COALESCE(SUM(p.valorPago), 0)
        FROM AgendamentoPagamento p
        WHERE p.idAgendamento = :agendamentoId
    """)
    BigDecimal sumValorPagoByAgendamentoId(@Param("agendamentoId") UUID agendamentoId);

    boolean existsByIdAgendamento(UUID idAgendamento);

    long countByIdAgendamento(UUID idAgendamento);
}
