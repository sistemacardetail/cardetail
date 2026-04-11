package br.com.cardetail.validator;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Orcamento;
import lombok.RequiredArgsConstructor;

import static java.util.Objects.isNull;

@RequiredArgsConstructor
@Component
public class OrcamentoValidator {

    public void validate(final Orcamento orcamento) {
        validateValores(orcamento);
    }

    public void validateValores(final Orcamento orcamento) {
        if (orcamento.getValorFinal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor final deve ser maior do que zero!");
        }

        if (orcamento.getValorDesconto().compareTo(orcamento.getValor()) > 0) {
            throw new IllegalArgumentException("O valor desconto não pode ser maior que o valor do orçamento.");
        }

        if (orcamento.getServicos().stream()
                .anyMatch(servico -> isNull(servico.getServico()) || servico.getValor().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("O valor do serviço deve ser maior do que zero.");
        }

        if (orcamento.getServicosTerceirizados().stream()
                .anyMatch(servico -> isNull(servico.getServico()) || servico.getValor().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("O valor do serviço terceirizado deve ser maior do que zero.");
        }
    }

}
