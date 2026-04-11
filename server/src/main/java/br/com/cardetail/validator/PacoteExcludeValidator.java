package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Pacote;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class PacoteExcludeValidator {

    private final AgendamentoRepository agendamentoRepository;
    private final OrcamentoRepository orcamentoRepository;

    public void validate(final Pacote pacote) {
        verifyExistsAgendamento(pacote);
        verifyExistsOrcamento(pacote);
    }

    private void verifyExistsAgendamento(final Pacote pacote) {
        if (agendamentoRepository.existsByPacoteId(pacote.getId())) {
            throw new IllegalArgumentException("O pacote está vinculado em agendamento e não pode ser excluído.");
        }
    }

    private void verifyExistsOrcamento(final Pacote pacote) {
        if (orcamentoRepository.existsByPacoteId(pacote.getId())) {
            throw new IllegalArgumentException("O pacote está vinculado em orçamento e não pode ser excluído.");
        }
    }

}
