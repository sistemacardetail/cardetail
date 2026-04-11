package br.com.cardetail.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.FindRepository;
import br.com.cardetail.domain.Cidade;

@Repository
public interface CidadeRepository extends FindRepository<Cidade, UUID> {

    @Query("""
        SELECT c
        FROM Cidade c
        JOIN c.uf u
        WHERE FUNCTION('unaccent', LOWER(c.nome)) = FUNCTION('unaccent', LOWER(:nome))
          AND LOWER(u.sigla) = LOWER(:uf)
    """)
    Optional<Cidade> findByNomeUf(@Param("nome") String nome, @Param("uf") String uf);

}
