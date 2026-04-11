package br.com.cardetail.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.repository.AgendamentoStatusRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AgendamentoStatusService {

    private final AgendamentoStatusRepository statusRepository;

    @Transactional
    public int updateIfExistsConfirmedToInProgress() {
        return statusRepository.updateIfExistsConfirmedToInProgress();
    }

    @Transactional
    public int updateIfExistsInProgressToCompleted() {
        return statusRepository.updateIfExistsInProgressToCompleted();
    }

    @Transactional
    public int updateIfExistsConfirmedToCompleted() {
        return statusRepository.updateIfExistsConfirmedToCompleted();
    }
}
