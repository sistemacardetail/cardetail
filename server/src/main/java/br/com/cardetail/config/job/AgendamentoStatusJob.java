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
            if (!statusService.hasAgendamentosPendentesDeAtualizacao()) {
                return;
            }

            statusService.updateAllStatus();
        } catch (Exception e) {
            log.error("Erro ao atualizar status dos agendamentos", e);
        }
    }

}
