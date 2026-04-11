package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.CorVeiculo;
import br.com.cardetail.validator.CorVeiculoExcludeValidator;
import br.com.cardetail.validator.CorVeiculoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CorVeiculoService extends BaseService<CorVeiculo, UUID> {

    private final CorVeiculoValidator validator;
    private final CorVeiculoExcludeValidator excludeValidator;

    @Override
    protected void beforeSave(final CorVeiculo entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(final CorVeiculo entity) {
        excludeValidator.validate(entity);
    }

}
