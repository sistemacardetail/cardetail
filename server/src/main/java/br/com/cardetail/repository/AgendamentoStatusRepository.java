package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.com.cardetail.domain.Agendamento;

@Repository
public interface AgendamentoStatusRepository extends JpaRepository<Agendamento, UUID> {

    @Modifying
    @Query("""
          UPDATE Agendamento a
          SET a.status = br.com.cardetail.enums.StatusAgendamento.EM_ANDAMENTO
          WHERE a.status = br.com.cardetail.enums.StatusAgendamento.CONFIRMADO
            AND a.dataPrevisaoInicio <= CURRENT_TIMESTAMP
            AND a.dataPrevisaoFim > CURRENT_TIMESTAMP
          """)
    int updateIfExistsConfirmedToInProgress();

    @Modifying
    @Query("""
          UPDATE Agendamento a
          SET a.status = br.com.cardetail.enums.StatusAgendamento.CONCLUIDO
          WHERE a.status = br.com.cardetail.enums.StatusAgendamento.EM_ANDAMENTO
            AND a.dataPrevisaoFim <= CURRENT_TIMESTAMP
          """)
    int updateIfExistsInProgressToCompleted();

    @Modifying
    @Query("""
          UPDATE Agendamento a
          SET a.status = br.com.cardetail.enums.StatusAgendamento.CONCLUIDO
          WHERE a.status = br.com.cardetail.enums.StatusAgendamento.CONFIRMADO
            AND a.dataPrevisaoFim <= CURRENT_TIMESTAMP
          """)
    int updateIfExistsConfirmedToCompleted();

}
