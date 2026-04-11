package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.ModeloVeiculo;
import br.com.cardetail.validator.ModeloVeiculoExcludeValidator;
import br.com.cardetail.validator.ModeloVeiculoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ModeloVeiculoService extends BaseService<ModeloVeiculo, UUID> {

    private final ModeloVeiculoValidator validator;
    private final ModeloVeiculoExcludeValidator excludeValidator;

    @Override
    protected void beforeSave(final ModeloVeiculo entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(final ModeloVeiculo entity) {
        excludeValidator.validate(entity);
    }

}
