package br.com.cardetail.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.ServicoTerceirizado;
import br.com.cardetail.validator.ServicoTerceirizadoExcludeValidator;
import br.com.cardetail.validator.ServicoTerceirizadoValidator;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ServicoTerceirizadoService extends BaseService<ServicoTerceirizado, UUID> {

    private final ServicoTerceirizadoValidator validator;
    private final ServicoTerceirizadoExcludeValidator excludeValidator;

    @Override
    protected void beforeDelete(ServicoTerceirizado entity) {
        excludeValidator.validate(entity);
    }

    @Override
    protected void beforeSave(ServicoTerceirizado entity) {
        validator.validate(entity);
    }

}
