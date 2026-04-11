package br.com.cardetail.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Cliente;
import br.com.cardetail.dto.ClienteDTO;
import br.com.cardetail.dto.VeiculoClienteDTO;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ClienteMapper {

    private final VeiculoMapper veiculoMapper;

    private ClienteDTO toDto(Cliente cliente) {
        return new ClienteDTO(
                cliente.getId().toString(),
                cliente.getNome(),
                cliente.isAtivo() ? "Ativo" : "Inativo",
                cliente.getTelefonePrincipal(),
                cliente.getObservacao(),
                veiculoMapper.toDtoList(cliente.getVeiculos())
        );
    }

    public List<ClienteDTO> toDtoList(List<Cliente> clientes) {
        return clientes.stream().map(this::toDto).toList();
    }

    private List<VeiculoClienteDTO> toVeiculoClienteDto(final Cliente cliente) {
        List<VeiculoClienteDTO> veiculos = new ArrayList<>();

        cliente.getVeiculos().forEach(veiculo -> veiculos.add(new VeiculoClienteDTO(
                veiculo.getId().toString(),
                cliente.getId().toString(),
                cliente.getNome(),
                cliente.getObservacao(),
                cliente.getTelefonePrincipal(),
                veiculo.getModelo().getNome(),
                veiculo.getMarca().getNome(),
                veiculo.getCor().getNome(),
                veiculo.getPlacaFormatted(),
                veiculo.getTipo().getDescricao(),
                veiculo.getTipo().getId().toString(),
                veiculo.getObservacao()
        )));

        return veiculos;
    }

    public List<VeiculoClienteDTO> toVeiculoClienteDtoList(List<Cliente> clientes) {
        List<VeiculoClienteDTO> dtos = new ArrayList<>();

        clientes.forEach(cliente -> dtos.addAll(toVeiculoClienteDto(cliente)));

        return dtos;
    }
}
