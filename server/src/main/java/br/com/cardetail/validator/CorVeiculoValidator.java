package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.CorVeiculo;
import br.com.cardetail.repository.CorVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class CorVeiculoValidator {

    private final CorVeiculoRepository repository;

    public void validate(final CorVeiculo corVeiculo) {
        verifyExistsNome(corVeiculo);
    }

    private void verifyExistsNome(final CorVeiculo corVeiculo) {
        if (repository.isNomeRepetido(corVeiculo.getId(), corVeiculo.getNome())) {
            throw new IllegalArgumentException(String.format("A cor de veículo %s já está cadastrada.", corVeiculo.getNome()));
        }
    }

}
