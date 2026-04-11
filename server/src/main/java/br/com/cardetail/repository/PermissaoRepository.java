package br.com.cardetail.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cardetail.domain.security.Permissao;

public interface PermissaoRepository extends JpaRepository<Permissao, Long> {

    Optional<Permissao> findByCodigo(String codigo);

    List<Permissao> findByModulo(String modulo);

    List<Permissao> findAllByOrderByModuloAscCodigoAsc();
}
