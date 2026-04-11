package br.com.cardetail.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.cardetail.domain.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, UUID id);

    Optional<Empresa> findByCnpj(String cnpj);

    @Query("SELECT e FROM Empresa e")
    Optional<Empresa> findFirst();
}
