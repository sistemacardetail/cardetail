package br.com.cardetail.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.ProdutoAutomotivo;
import br.com.cardetail.dto.ProdutoAutomotivoDTO;

@Component
public class ProdutoAutomotivoMapper {

    private ProdutoAutomotivoDTO toDto(ProdutoAutomotivo produto) {
        return new ProdutoAutomotivoDTO(
                produto.getId().toString(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getMarca().getNome(),
                produto.getTamanho().getUnidade().getNome(),
                produto.getTamanho().getDescricao(),
                produto.getTipo().getDescricao()
        );
    }

    public List<ProdutoAutomotivoDTO> toDtoList(List<ProdutoAutomotivo> produtos) {
        return produtos.stream().map(this::toDto).toList();
    }
}
