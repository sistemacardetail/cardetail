package br.com.cardetail.converter;

import br.com.cardetail.enums.StatusOrcamento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusOrcamentoConverter implements AttributeConverter<StatusOrcamento, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusOrcamento statusOrcamento) {
        return statusOrcamento == null ? null : statusOrcamento.getId();
    }

    @Override
    public StatusOrcamento convertToEntityAttribute(Integer id) {
        return id == null ? null : StatusOrcamento.fromId(id);
    }
}
