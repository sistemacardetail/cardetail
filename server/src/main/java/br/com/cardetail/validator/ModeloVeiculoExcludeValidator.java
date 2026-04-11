package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.ModeloVeiculo;
import br.com.cardetail.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ModeloVeiculoExcludeValidator {

    private final VeiculoRepository veiculoRepository;

    public void validate(final ModeloVeiculo modeloVeiculo) {
        verifyExistsVeiculo(modeloVeiculo);
    }

    private void verifyExistsVeiculo(final ModeloVeiculo modeloVeiculo) {
        if (veiculoRepository.existsByModeloId(modeloVeiculo.getId())) {
            throw new IllegalArgumentException("O modelo está vinculado em veículo e não pode ser excluído.");
        }
    }

}
