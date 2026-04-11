package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.TipoVeiculo;

@Repository
public interface TipoVeiculoRepository extends BaseRepository<TipoVeiculo, UUID> {

    @Query("""
        SELECT COUNT(1) > 0
        FROM TipoVeiculo t
        WHERE t.descricao ILIKE :descricao
        AND (:idTipo IS NULL OR t.id <> :idTipo)
    """)
    boolean isDescricaoRepetida(@Param("idTipo") UUID idTipo, @Param("descricao") String descricao);

}
