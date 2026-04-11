package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.Orcamento;
import br.com.cardetail.enums.CrudOperation;
import br.com.cardetail.enums.StatusOrcamento;
import br.com.cardetail.validator.OrcamentoStatusValidator;
import br.com.cardetail.validator.OrcamentoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class OrcamentoService extends BaseService<Orcamento, UUID> {

    private final OrcamentoValidator validator;
    private final OrcamentoStatusValidator statusValidator;

    @Override
    protected void beforeSave(Orcamento entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(Orcamento entity) {
        statusValidator.validateExclude(entity);
    }

    @Transactional
    public void updateStatus(final UUID id, final StatusOrcamento status) {
        Orcamento orcamento = findOne(id);

        statusValidator.validate(orcamento, CrudOperation.UPDATE);

        orcamento.setStatus(status);
        save(orcamento);
    }

    public void removeAgendamento(final UUID id) {
        Orcamento orcamento = findOne(id);
        if (StatusOrcamento.AGENDADO.equals(orcamento.getStatus())) {
            orcamento.setStatus(StatusOrcamento.PENDENTE);
            save(orcamento);
        }
    }

    public void confirmaAgendamento(final UUID id) {
        Orcamento orcamento = findOne(id);
        if (!StatusOrcamento.AGENDADO.equals(orcamento.getStatus())) {
            orcamento.setStatus(StatusOrcamento.AGENDADO);
            save(orcamento);
        }
    }
}
