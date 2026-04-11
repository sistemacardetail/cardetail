package br.com.cardetail.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.cardetail.domain.security.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {

    Optional<Perfil> findByNome(String nome);

    boolean existsByNome(String nome);

    boolean existsByNomeAndIdNot(String nome, Long id);

    List<Perfil> findByAtivoTrueOrderByNivelAsc();

    List<Perfil> findAllByOrderByNivelAsc();
}
