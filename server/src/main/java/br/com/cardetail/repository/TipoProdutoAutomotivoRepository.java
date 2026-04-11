package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.TipoProdutoAutomotivo;

@Repository
public interface TipoProdutoAutomotivoRepository extends BaseRepository<TipoProdutoAutomotivo, UUID> {

}
