package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.MarcaVeiculo;
import br.com.cardetail.repository.MarcaVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class MarcaVeiculoValidator {

    private final MarcaVeiculoRepository repository;

    public void validate(final MarcaVeiculo marcaVeiculo) {
        verifyExistsNome(marcaVeiculo);
    }

    private void verifyExistsNome(final MarcaVeiculo marcaVeiculo) {
        if (repository.isNomeRepetido(marcaVeiculo.getId(), marcaVeiculo.getNome())) {
            throw new IllegalArgumentException(String.format("A marca de veículo %s já está cadastrada.", marcaVeiculo.getNome()));
        }
    }

}
