package br.com.cardetail.validator;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Agendamento;
import br.com.cardetail.repository.AgendamentoPagamentoRepository;
import lombok.RequiredArgsConstructor;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

@RequiredArgsConstructor
@Component
public class AgendamentoValidator {

    private final AgendamentoPagamentoRepository pagamentoRepository;

    public void validate(final Agendamento agendamento) {
        validateStatus(agendamento);
        validateValores(agendamento);
        validateDatas(agendamento);
        validateValorPago(agendamento);
    }

    public void validateStatus(final Agendamento agendamento) {
        if (agendamento.isCancelado()) {
            throw new IllegalArgumentException("Não é permitido alterar agendamento cancelado.");
        }
        if (agendamento.isPago()) {
            throw new IllegalArgumentException("Não é permitido alterar agendamento com pagamento quitado.");
        }
    }

    public void validateValores(final Agendamento agendamento) {
        if (agendamento.getValorFinal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor final deve ser maior do que zero!");
        }

        if (agendamento.getValorDesconto().compareTo(agendamento.getValor()) > 0) {
            throw new IllegalArgumentException("O valor desconto não pode ser maior que o valor do agendamento.");
        }

        if (agendamento.getServicos().stream()
                .anyMatch(servico -> isNull(servico.getServico()) || servico.getValor().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("O valor do serviço deve ser maior do que zero.");
        }

        if (agendamento.getServicosTerceirizados().stream()
                .anyMatch(servico -> isNull(servico.getServico()) || servico.getValor().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("O valor do serviço terceirizado deve ser maior do que zero.");
        }
    }

    public void validateDatas(final Agendamento agendamento) {
        if (isNull(agendamento.getDataPrevisaoInicio()) || isNull(agendamento.getDataPrevisaoFim())) {
            throw new IllegalArgumentException("As datas de previsão devem ser preenchidas!");
        }

        if (agendamento.getDataPrevisaoInicio().isAfter(agendamento.getDataPrevisaoFim())) {
            throw new IllegalArgumentException("A data pervisão fim deve ser posterior à data previsão início.");
        }
    }

    public void validateValorPago(final Agendamento agendamento) {
        if (isNull(agendamento.getId())) {
            return;
        }

        BigDecimal valorPagoTotal = pagamentoRepository.sumValorPagoByAgendamentoId(agendamento.getId());
        if (nonNull(valorPagoTotal) && valorPagoTotal.compareTo(BigDecimal.ZERO) > 0) {
            if (agendamento.getValorFinal().compareTo(valorPagoTotal) < 0) {
                throw new IllegalArgumentException(
                    String.format("O valor final (R$ %.2f) não pode ser menor que o valor já pago (R$ %.2f).",
                        agendamento.getValorFinal(), valorPagoTotal));
            }
        }
    }
}
