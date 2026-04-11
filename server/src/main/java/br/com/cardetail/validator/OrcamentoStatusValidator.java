package br.com.cardetail.validator;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Orcamento;
import br.com.cardetail.enums.CrudOperation;

@Component
public class OrcamentoStatusValidator {

    public void validate(final Orcamento orcamento, final CrudOperation crudOperation) {
        if (orcamento.notIsPendente()) {
            throw new IllegalArgumentException(
                    String.format("Somente é permitido %s orçamento com status Pendente.", crudOperation.getDescription()));
        }
    }

    public void validateExclude(final Orcamento orcamento) {
        if (orcamento.isAgendado()) {
            throw new IllegalArgumentException("Não é permitido excluir orçamento com status Agendado.");
        }
    }

}
