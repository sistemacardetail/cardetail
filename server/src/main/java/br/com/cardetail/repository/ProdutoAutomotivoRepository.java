package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.ProdutoAutomotivo;

@Repository
public interface ProdutoAutomotivoRepository extends BaseRepository<ProdutoAutomotivo, UUID> {

}
