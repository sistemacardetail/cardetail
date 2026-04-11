package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Servico;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.OrcamentoRepository;
import br.com.cardetail.repository.PacoteRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ServicoExcludeValidator {

    private final PacoteRepository pacoteRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final AgendamentoRepository agendamentoRepository;

    public void validate(final Servico servico) {
        verifyExistsPacote(servico);
        verifyExistsOrcamento(servico);
        verifyExistsAgendamento(servico);
    }

    private void verifyExistsOrcamento(final Servico servico) {
        if (orcamentoRepository.existsByServicosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço está vinculado em orçamento e não pode ser excluído.");
        }
    }

    private void verifyExistsAgendamento(final Servico servico) {
        if (agendamentoRepository.existsByServicosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço está vinculado em agendamento e não pode ser excluído.");
        }
    }

    private void verifyExistsPacote(final Servico servico) {
        if (pacoteRepository.existsByServicosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço está vinculado em pacote e não pode ser excluído.");
        }
    }

}
