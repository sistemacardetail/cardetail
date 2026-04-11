package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.validator.TipoVeiculoExcludeValidator;
import br.com.cardetail.validator.TipoVeiculoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TipoVeiculoService extends BaseService<TipoVeiculo, UUID> {

    private final TipoVeiculoValidator validator;
    private final TipoVeiculoExcludeValidator excludeValidator;

    @Override
    protected void beforeSave(final TipoVeiculo entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(final TipoVeiculo entity) {
        excludeValidator.validate(entity);
    }

}
