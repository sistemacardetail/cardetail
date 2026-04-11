package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.ServicoTerceirizado;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ServicoTerceirizadoExcludeValidator {

    private final OrcamentoRepository orcamentoRepository;
    private final AgendamentoRepository agendamentoRepository;

    public void validate(final ServicoTerceirizado servico) {
        verifyExistsOrcamento(servico);
        verifyExistsAgendamento(servico);
    }

    private void verifyExistsOrcamento(final ServicoTerceirizado servico) {
        if (orcamentoRepository.existsByServicosTerceirizadosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço terceirizado está vinculado em orçamento e não pode ser excluído.");
        }
    }

    private void verifyExistsAgendamento(final ServicoTerceirizado servico) {
        if (agendamentoRepository.existsByServicosTerceirizadosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço terceirizado está vinculado em agendamento e não pode ser excluído.");
        }
    }

}
