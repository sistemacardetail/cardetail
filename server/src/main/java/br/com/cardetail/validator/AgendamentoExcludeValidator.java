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
public class AgendamentoExcludeValidator {

    private final AgendamentoPagamentoRepository pagamentoRepository;

    public void validate(final Agendamento agendamento) {
        validateValorPago(agendamento);
    }

    public void validateValorPago(final Agendamento agendamento) {
        if (isNull(agendamento.getId())) {
            return;
        }

        BigDecimal valorPagoTotal = pagamentoRepository.sumValorPagoByAgendamentoId(agendamento.getId());
        if (nonNull(valorPagoTotal) && valorPagoTotal.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Não é permitido excluir agendamento que possui pagamento.");
        }
    }
}
