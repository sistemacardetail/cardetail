package br.com.cardetail.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.Cliente;

@Repository
public interface ClienteRepository extends BaseRepository<Cliente, UUID> {

    @Query("SELECT c FROM Cliente c JOIN c.veiculos v WHERE v.id = :veiculoId")
    Optional<Cliente> findByVeiculoId(@Param("veiculoId") UUID veiculoId);

    @Query("""
        SELECT v.placa
        FROM Cliente c
        JOIN c.veiculos v
        WHERE v.placa IN :placas
        AND (:idCliente IS NULL OR c.id <> :idCliente)
    """)
    List<String> getPlacasRepetidas(@Param("idCliente") UUID idCLiente, @Param("placas") Set<String> placas);

    @Query("""
        SELECT t.numero
        FROM Cliente c
        JOIN c.telefones ct
        JOIN ct.telefone t
        WHERE t.numero IN :telefones
        AND (:idCliente IS NULL OR c.id <> :idCliente)
    """)
    List<String> getTelefonesRepetidos(@Param("idCliente") UUID idCLiente, @Param("telefones") Set<String> telefones);

}
