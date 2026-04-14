package br.com.cardetail.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.repository.AgendamentoStatusRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AgendamentoStatusService {

    private final AgendamentoStatusRepository statusRepository;

    @Transactional(readOnly = true)
    public boolean hasAgendamentosPendentesDeAtualizacao() {
        return statusRepository.hasAgendamentosPendentesDeAtualizacao();
    }

    @Transactional
    public void updateAllStatus() {
        statusRepository.updateConfirmedToCompleted();
        statusRepository.updateConfirmedToInProgress();
        statusRepository.updateInProgressToCompleted();
    }
}
