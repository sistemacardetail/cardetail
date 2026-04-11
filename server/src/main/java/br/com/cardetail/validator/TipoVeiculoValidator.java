package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.repository.TipoVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class TipoVeiculoValidator {

    private final TipoVeiculoRepository repository;

    public void validate(final TipoVeiculo tipoVeiculo) {
        verifyExistsNome(tipoVeiculo);
    }

    private void verifyExistsNome(final TipoVeiculo tipoVeiculo) {
        if (repository.isDescricaoRepetida(tipoVeiculo.getId(), tipoVeiculo.getDescricao())) {
            throw new IllegalArgumentException(String.format("O tipo de veículo %s já está cadastrado.", tipoVeiculo.getDescricao()));
        }
    }

}
