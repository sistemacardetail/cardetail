package br.com.cardetail.converter;

import br.com.cardetail.enums.StatusPagamento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusPagamentoConverter implements AttributeConverter<StatusPagamento, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusPagamento attribute) {
        if (attribute == null) {
            return StatusPagamento.PENDENTE.getId();
        }
        return attribute.getId();
    }

    @Override
    public StatusPagamento convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return StatusPagamento.PENDENTE;
        }
        return StatusPagamento.fromId(dbData);
    }
}
