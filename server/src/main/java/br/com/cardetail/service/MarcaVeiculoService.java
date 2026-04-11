package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.MarcaVeiculo;
import br.com.cardetail.validator.MarcaVeiculoExcludeValidator;
import br.com.cardetail.validator.MarcaVeiculoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class MarcaVeiculoService extends BaseService<MarcaVeiculo, UUID> {

    private final MarcaVeiculoValidator validator;
    private final MarcaVeiculoExcludeValidator excludeValidator;

    @Override
    protected void beforeSave(final MarcaVeiculo entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(final MarcaVeiculo entity) {
        excludeValidator.validate(entity);
    }
}
