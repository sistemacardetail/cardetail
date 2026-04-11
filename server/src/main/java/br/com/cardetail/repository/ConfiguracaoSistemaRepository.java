package br.com.cardetail.repository;

import java.util.Optional;
import java.util.UUID;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.ConfiguracaoSistema;

public interface ConfiguracaoSistemaRepository extends BaseRepository<ConfiguracaoSistema, UUID> {

    Optional<ConfiguracaoSistema> findByKey(String chave);

}
