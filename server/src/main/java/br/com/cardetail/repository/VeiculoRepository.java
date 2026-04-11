package br.com.cardetail.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.domain.Veiculo;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, UUID> {

    boolean existsByCorId(@Param("idCor") UUID idCor);

    boolean existsByModeloId(@Param("idModelo") UUID idModelo);

    @Query("SELECT v FROM Veiculo v WHERE v.cliente.id = :idCliente")
    List<Veiculo> findByClienteId(@Param("idCliente") UUID idCliente);

}
