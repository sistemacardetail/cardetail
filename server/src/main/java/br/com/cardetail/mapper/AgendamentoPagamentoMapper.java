package br.com.cardetail.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.AgendamentoPagamento;
import br.com.cardetail.dto.AgendamentoPagamentoDTO;
import br.com.cardetail.dto.AgendamentoPagamentoRequestDTO;

@Component
public class AgendamentoPagamentoMapper {

    public AgendamentoPagamentoDTO toDTO(AgendamentoPagamento entity) {
        if (entity == null) {
            return null;
        }

        return new AgendamentoPagamentoDTO(
            entity.getId() != null ? entity.getId().toString() : null,
            entity.getValorPago(),
            entity.getDataRecebimento(),
            entity.getFormaPagamento(),
            entity.getFormaPagamento() != null ? entity.getFormaPagamento().getDescricao() : null,
            entity.getObservacao(),
            entity.getDataCriacao()
        );
    }

    public List<AgendamentoPagamentoDTO> toDTOList(List<AgendamentoPagamento> entities) {
        return entities.stream()
            .map(this::toDTO)
            .toList();
    }

    public AgendamentoPagamento toEntity(AgendamentoPagamentoRequestDTO dto) {
        AgendamentoPagamento entity = new AgendamentoPagamento();
        entity.setValorPago(dto.valorPago());
        entity.setDataRecebimento(dto.dataRecebimento());
        entity.setFormaPagamento(dto.formaPagamento());
        entity.setObservacao(dto.observacao());
        return entity;
    }
}
