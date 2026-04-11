package br.com.cardetail.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.ModeloVeiculo;

@Repository
public interface ModeloVeiculoRepository extends BaseRepository<ModeloVeiculo, UUID> {

    @Query("""
        SELECT COUNT(1) > 0
        FROM ModeloVeiculo m
        WHERE m.nome ILIKE :nome
        AND (:idModelo IS NULL OR m.id <> :idModelo)
    """)
    boolean isNomeRepetido(@Param("idModelo") UUID idModelo, @Param("nome") String nome);

    boolean existsByMarcaId(@Param("idMarca") UUID idMarca);

    boolean existsByTipoId(@Param("idTipo") UUID idTipo);
}
