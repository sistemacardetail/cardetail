package br.com.cardetail.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import java.util.Optional;

@NoRepositoryBean
public interface FindRepository<T, K> extends Repository<T, K>, JpaSpecificationExecutor<T> {

    default T findOne(K id) {
        return this.findById(id).orElse(null);
    }

    Iterable<T> findAll(Sort var1);

    Page<T> findAll(Pageable var1);

    Optional<T> findById(K var1);

}
