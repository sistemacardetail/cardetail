package br.com.cardetail.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.Cliente;
import br.com.cardetail.dto.ClienteDTO;
import br.com.cardetail.dto.VeiculoClienteDTO;
import br.com.cardetail.mapper.ClienteMapper;
import br.com.cardetail.validator.ClienteExcludeValidator;
import br.com.cardetail.validator.ClienteValidator;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClienteService extends BaseService<Cliente, UUID> {

    private final ClienteValidator validator;
    private final ClienteExcludeValidator excludeValidator;
    private final ClienteMapper mapper;

    @Override
    protected void beforeSave(Cliente entity) {
        validator.validate(entity);
    }

    @Override
    protected void beforeDelete(Cliente entity) {
        excludeValidator.validate(entity);
    }

    public Page<ClienteDTO> findAllBySearch(final String search, final Pageable pageable) {
        final Page<Cliente> clientes = findAll(
                createSpecification(Optional.empty(), buildRsqlFilter(search)), pageable);

        final List<ClienteDTO> dtoList = mapper.toDtoList(clientes.getContent());

        return new PageImpl<>(dtoList, pageable, clientes.getTotalElements());
    }

    public Page<VeiculoClienteDTO> getVeiculosList(final String search, final Pageable pageable) {
        final Page<Cliente> clientes = findAll(
                createSpecification(Optional.empty(), buildRsqlFilter(search)), pageable);

        final List<VeiculoClienteDTO> dtoList = mapper.toVeiculoClienteDtoList(clientes.getContent());

        return new PageImpl<>(dtoList, pageable, clientes.getTotalElements());
    }

}
