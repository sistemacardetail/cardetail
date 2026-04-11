package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.CorVeiculo;

@Repository
public interface CorVeiculoRepository extends BaseRepository<CorVeiculo, UUID> {

    @Query("""
        SELECT COUNT(1) > 0
        FROM CorVeiculo c
        WHERE c.nome ILIKE :nome
        AND (:idCor IS NULL OR c.id <> :idCor)
    """)
    boolean isNomeRepetido(@Param("idCor") UUID idCor, @Param("nome") String nome);

}
