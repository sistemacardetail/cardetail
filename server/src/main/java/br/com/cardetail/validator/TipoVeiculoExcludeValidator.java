package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.repository.ModeloVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class TipoVeiculoExcludeValidator {

    private final ModeloVeiculoRepository modeloVeiculoRepository;

    public void validate(final TipoVeiculo tipoVeiculo) {
        verifyExistsModeloVeiculo(tipoVeiculo);
    }

    private void verifyExistsModeloVeiculo(final TipoVeiculo tipoVeiculo) {
        if (modeloVeiculoRepository.existsByTipoId(tipoVeiculo.getId())) {
            throw new IllegalArgumentException("O tipo está vinculado em modelo de veículo e não pode ser excluído.");
        }
    }

}
