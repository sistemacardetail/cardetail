package br.com.cardetail.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Veiculo;
import br.com.cardetail.dto.VeiculoDTO;

@Component
public class VeiculoMapper {

    private VeiculoDTO toDto(Veiculo veiculo) {
        return new VeiculoDTO(
                veiculo.getId().toString(),
                veiculo.getModelo().getNome(),
                veiculo.getCor().getNome(),
                veiculo.getMarca().getNome(),
                veiculo.getTipo().getDescricao(),
                veiculo.getPlacaFormatted(),
                veiculo.getObservacao()
        );
    }

    public List<VeiculoDTO> toDtoList(List<Veiculo> veiculos) {
        return veiculos.stream().map(this::toDto).toList();
    }

}
