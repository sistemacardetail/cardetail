package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.MarcaVeiculo;

@Repository
public interface MarcaVeiculoRepository extends BaseRepository<MarcaVeiculo, UUID> {

    @Query("""
        SELECT COUNT(1) > 0
        FROM MarcaVeiculo m
        WHERE m.nome ILIKE :nome
        AND (:idMarca IS NULL OR m.id <> :idMarca)
    """)
    boolean isNomeRepetido(@Param("idMarca") UUID idMarca, @Param("nome") String nome);

}
