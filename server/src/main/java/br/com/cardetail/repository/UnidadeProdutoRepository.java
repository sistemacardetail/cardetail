package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.UnidadeProduto;

@Repository
public interface UnidadeProdutoRepository extends BaseRepository<UnidadeProduto, UUID> {

}
