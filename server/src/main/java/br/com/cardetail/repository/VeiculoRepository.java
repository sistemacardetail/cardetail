package br.com.cardetail.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.domain.Veiculo;
import br.com.cardetail.dto.VeiculoAutocompleteDTO;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, UUID> {

    boolean existsByCorId(@Param("idCor") UUID idCor);

    boolean existsByModeloId(@Param("idModelo") UUID idModelo);

    @Query("SELECT v FROM Veiculo v WHERE v.cliente.id = :idCliente")
    List<Veiculo> findByClienteId(@Param("idCliente") UUID idCliente);

    @Query("""
        SELECT new br.com.cardetail.dto.VeiculoAutocompleteDTO(v.id, m.nome, marca.nome, c.nome, v.placa, t.id, cli.id, v.observacao)
        FROM Veiculo v
        JOIN v.modelo m
        JOIN m.marca marca
        JOIN m.tipo t
        JOIN v.cor c
        JOIN v.cliente cli
        WHERE cli.ativo = true AND v.ativo = true
        AND (:idCliente IS NULL OR :idCliente = cli.id)
        AND (LOWER(m.nome) LIKE LOWER(:search)
            OR LOWER(marca.nome) LIKE LOWER(:search)
            OR LOWER(v.placa) LIKE LOWER(:search)
            OR LOWER(c.nome) LIKE LOWER(:search)
        )
        ORDER BY m.nome
    """)
    List<VeiculoAutocompleteDTO> findToAutocomplete(final UUID idCliente, final String search, final Pageable pageable);

}
