package br.com.cardetail.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.Pacote;
import br.com.cardetail.repository.PacoteRepository;
import br.com.cardetail.validator.PacoteExcludeValidator;
import br.com.cardetail.validator.PacoteValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PacoteService extends BaseService<Pacote, UUID> {

    private final PacoteValidator validator;
    private final PacoteExcludeValidator excludeValidator;
    private final PacoteRepository repository;

    @Override
    protected void beforeDelete(Pacote entity) {
        excludeValidator.validate(entity);
    }

    @Override
    protected void beforeSave(Pacote entity) {
        validator.validate(entity);
    }

    public List<Pacote> getPacotesAgendamento(final UUID idTipoVeiculo) {
        return repository.getPacotesAgendamento(idTipoVeiculo);
    }

}
