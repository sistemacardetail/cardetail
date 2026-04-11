package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.MarcaVeiculo;
import br.com.cardetail.repository.ModeloVeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class MarcaVeiculoExcludeValidator {

    private final ModeloVeiculoRepository modeloVeiculoRepository;

    public void validate(final MarcaVeiculo marcaVeiculo) {
        verifyExistsModelo(marcaVeiculo);
    }

    private void verifyExistsModelo(final MarcaVeiculo marcaVeiculo) {
        if (modeloVeiculoRepository.existsByMarcaId(marcaVeiculo.getId())) {
            throw new IllegalArgumentException("A marca está vinculada em modelo de veículo e não pode ser excluída.");
        }
    }

}
