package br.com.cardetail.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Cliente;
import br.com.cardetail.dto.ClienteDTO;
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

}
