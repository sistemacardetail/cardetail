package br.com.cardetail.converter;

import br.com.cardetail.enums.StatusAgendamento;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusAgendamentoConverter implements AttributeConverter<StatusAgendamento, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusAgendamento statusAgendamento) {
        return statusAgendamento == null ? null : statusAgendamento.getId();
    }

    @Override
    public StatusAgendamento convertToEntityAttribute(Integer id) {
        return id == null ? null : StatusAgendamento.fromId(id);
    }
}
