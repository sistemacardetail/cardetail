package br.com.cardetail.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.Agendamento;
import br.com.cardetail.enums.StatusAgendamento;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.validator.AgendamentoExcludeValidator;
import br.com.cardetail.validator.AgendamentoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AgendamentoService extends BaseService<Agendamento, UUID> {

    private final OrcamentoService orcamentoService;
    private final AgendamentoValidator validator;
    private final AgendamentoExcludeValidator excludeValidator;
    private final AgendamentoRepository repository;

    @Override
    protected void afterDelete(Agendamento entity) {
        if (entity.hasOrcamento()) {
            orcamentoService.removeAgendamento(entity.getOrcamento().getId());
        }
    }

    @Override
    protected void afterSave(Agendamento entity) {
        if (entity.hasOrcamento()) {
            orcamentoService.confirmaAgendamento(entity.getOrcamento().getId());
        }
    }

    @Override
    protected void beforeSave(Agendamento entity) {
        validator.validate(entity);
        entity.setStatusByDate();
    }

    @Override
    protected void beforeDelete(Agendamento entity) {
        excludeValidator.validate(entity);
    }

    @Transactional
    public void updateStatus(UUID id, StatusAgendamento status) {
        Agendamento agendamento = findOne(id);
        if (agendamento != null) {
            agendamento.setStatus(status);
            repository.save(agendamento);
        }
    }

    @Transactional
    public void updateDatas(UUID id, LocalDateTime dataPrevisaoInicio, LocalDateTime dataPrevisaoFim) {
        Agendamento agendamento = findOne(id);
        if (agendamento != null) {
            agendamento.setDataPrevisaoInicio(dataPrevisaoInicio);
            agendamento.setDataPrevisaoFim(dataPrevisaoFim);
            agendamento.setStatusByDate();
            repository.save(agendamento);
        }
    }

}
