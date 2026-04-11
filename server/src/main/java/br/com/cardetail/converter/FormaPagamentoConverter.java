package br.com.cardetail.converter;

import br.com.cardetail.enums.FormaPagamento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class FormaPagamentoConverter implements AttributeConverter<FormaPagamento, Integer> {

    @Override
    public Integer convertToDatabaseColumn(FormaPagamento attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getId();
    }

    @Override
    public FormaPagamento convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return null;
        }
        return FormaPagamento.fromId(dbData);
    }
}
