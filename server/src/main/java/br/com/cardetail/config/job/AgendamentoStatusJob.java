package br.com.cardetail.config.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.com.cardetail.service.AgendamentoStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgendamentoStatusJob {

    private final AgendamentoStatusService statusService;

    @Scheduled(fixedRateString = "${app.job.agendamento-status.interval-ms:300000}")
    public void updateAgendamentoStatus() {
        try {
            int updateConfirmed = statusService.updateIfExistsConfirmedToInProgress();
            int updatedInProgress = statusService.updateIfExistsInProgressToCompleted();
            int updateToCompleted = statusService.updateIfExistsConfirmedToCompleted();

            int total = updateConfirmed + updatedInProgress + updateToCompleted;

            if (total > 0) {
                log.debug("Update status: {} CONFIRMADO > EM_ANDAMENTO, {} EM_ANDAMENTO > CONCLUIDO, {} CONFIRMADO > CONCLUIDO",
                        updateConfirmed, updatedInProgress, updateToCompleted);
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar status dos agendamentos", e);
        }
    }

}
