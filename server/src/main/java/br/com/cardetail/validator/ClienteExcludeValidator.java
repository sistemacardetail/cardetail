package br.com.cardetail.validator;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Cliente;
import br.com.cardetail.domain.Veiculo;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ClienteExcludeValidator {

    private final AgendamentoRepository agendamentoRepository;
    private final OrcamentoRepository orcamentoRepository;

    public void validate(final Cliente cliente) {
        verifyExistsAgendamento(cliente.getVeiculos());
        verifyExistsOrcamento(cliente.getVeiculos());
    }

    private void verifyExistsAgendamento(final List<Veiculo> veiculos) {
        final Set<UUID> idsVeiculos = veiculos.stream()
                .map(Veiculo::getId)
                .collect(Collectors.toSet());

        if (agendamentoRepository.existsByVeiculoIdIn(idsVeiculos)) {
            throw new IllegalArgumentException("O cliente está vinculado em agendamento e não pode ser excluído, inative o cliente.");
        }
    }

    private void verifyExistsOrcamento(final List<Veiculo> veiculos) {
        final Set<UUID> idsVeiculos = veiculos.stream()
                .map(Veiculo::getId)
                .collect(Collectors.toSet());

        if (orcamentoRepository.existsByVeiculoIdIn(idsVeiculos)) {
            throw new IllegalArgumentException("O cliente está vinculado em orçamento e não pode ser excluído, inative o cliente.");
        }
    }

}
