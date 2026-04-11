package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.ModeloVeiculo;
import br.com.cardetail.repository.ModeloVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ModeloVeiculoValidator {

    private final ModeloVeiculoRepository repository;

    public void validate(final ModeloVeiculo modeloVeiculo) {
        verifyExistsNome(modeloVeiculo);
    }

    private void verifyExistsNome(final ModeloVeiculo modeloVeiculo) {
        if (repository.isNomeRepetido(modeloVeiculo.getId(), modeloVeiculo.getNome())) {
            throw new IllegalArgumentException(String.format("O modelo de veículo %s já está cadastrado .", modeloVeiculo.getNome()));
        }
    }

}
