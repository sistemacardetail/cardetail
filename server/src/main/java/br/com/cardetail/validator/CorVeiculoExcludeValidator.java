package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.CorVeiculo;
import br.com.cardetail.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class CorVeiculoExcludeValidator {

    private final VeiculoRepository veiculoRepository;

    public void validate(final CorVeiculo corVeiculo) {
        verifyExistsVeiculo(corVeiculo);
    }

    private void verifyExistsVeiculo(final CorVeiculo corVeiculo) {
        if (veiculoRepository.existsByCorId(corVeiculo.getId())) {
            throw new IllegalArgumentException("A cor está vinculada em veículo e não pode ser excluída.");
        }
    }

}
