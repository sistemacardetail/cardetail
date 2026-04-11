package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Veiculo;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class VeiculoExcludeValidator {

    private final AgendamentoRepository agendamentoRepository;
    private final OrcamentoRepository orcamentoRepository;

    public void validate(final Veiculo veiculo) {
        verifyExistsAgendamento(veiculo);
        verifyExistsOrcamento(veiculo);
    }

    private void verifyExistsAgendamento(final Veiculo veiculo) {
        if (agendamentoRepository.existsByVeiculoId(veiculo.getId())) {
            throw new IllegalArgumentException(String
                    .format("O veículo [%s - placa: %s] possui agendamento e não pode ser excluído.", veiculo.getMarcaAndModelo(), veiculo.getPlacaFormatted()));
        }
    }

    private void verifyExistsOrcamento(final Veiculo veiculo) {
        if (orcamentoRepository.existsByVeiculoId(veiculo.getId())) {
            throw new IllegalArgumentException(String
                    .format("O veículo [%s - placa: %s] possui orçamento e não pode ser excluído.", veiculo.getMarcaAndModelo(), veiculo.getPlacaFormatted()));
        }
    }

}
