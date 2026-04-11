package br.com.cardetail.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.cardetail.domain.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    List<Usuario> findByAdminFalse();

    Optional<Usuario> findByLogin(String login);

    boolean existsByLogin(String login);

    boolean existsByLoginAndIdNot(String login, UUID id);

    List<Usuario> findByAtivoTrueAndAdminFalse();

    @Query("SELECT u FROM Usuario u WHERE u.perfil.id = :perfilId")
    List<Usuario> findByPerfilId(@Param("perfilId") Long perfilId);

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.perfil.nome = 'ADMINISTRADOR' AND u.ativo = true")
    long countAdministradoresAtivos();

    @Query("SELECT u FROM Usuario u WHERE u.nome ILIKE CONCAT('%', :nome, '%')")
    List<Usuario> findByNomeLike(@Param("nome") String nome);
}
