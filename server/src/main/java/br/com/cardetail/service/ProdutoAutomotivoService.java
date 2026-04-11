package br.com.cardetail.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.ProdutoAutomotivo;
import br.com.cardetail.dto.ProdutoAutomotivoDTO;
import br.com.cardetail.mapper.ProdutoAutomotivoMapper;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ProdutoAutomotivoService extends BaseService<ProdutoAutomotivo, UUID> {

    private final ProdutoAutomotivoMapper mapper;

    public Page<ProdutoAutomotivoDTO> findAllBySearch(final String search, final Pageable pageable) {
        final Page<ProdutoAutomotivo> produtos = findAll(
                createSpecification(Optional.empty(), buildRsqlFilter(search)), pageable);

        final List<ProdutoAutomotivoDTO> dtoList = mapper.toDtoList(produtos.getContent());

        return new PageImpl<>(dtoList, pageable, produtos.getTotalElements());
    }

}
