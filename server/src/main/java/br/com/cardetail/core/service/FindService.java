package br.com.cardetail.core.service;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.core.external.misc.Mapper;
import br.com.cardetail.core.repository.FindRepository;
import br.com.cardetail.core.utils.RsqlUtils;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Transactional(readOnly = true)
@NoArgsConstructor
@Getter
public class FindService<T extends BaseDomain<K>, K extends Serializable> {

    @Setter
    @Autowired
    private FindRepository<T, K> repository;

    @Setter
    @PersistenceContext
    private EntityManager em;

    private final transient Logger log = LoggerFactory.getLogger(this.getClass());

    public Page<T> findAll(Pageable pageable) {
        return this.repository.findAll(pageable);
    }

    public Page<T> findAll(Specification<T> specification, Pageable pageable) {
        return this.repository.findAll(specification, pageable);
    }

    public T findOne(K id) {
        return repository.findOne(id);
    }

    public Optional<T> findById(K id) {
        return Optional.ofNullable(repository.findOne(id));
    }

    public List<T> findAll(Specification<T> specification) {
        return this.repository.findAll(specification);
    }

    public Page<T> findByRsql(String rsqlFilter, Pageable pageable) {
        return this.findByRsql(rsqlFilter, pageable, Optional.empty());
    }

    public Page<T> findByRsql(String rsqlFilter, Pageable pageable, Optional<Mapper> rsqlMapper) {

        String rsqlFilterBuilded = this.buildRsqlFilter(rsqlFilter);

        if (isBlank(rsqlFilterBuilded)) {

            return this.findAll(pageable);
        }

        Specification<T> specification = this.createSpecification(rsqlMapper, rsqlFilterBuilded);

        return this.findAll(specification, pageable);
    }

    public Specification<T> createSpecification(Optional<Mapper> rsqlMapper, String rsqlFilter) {

        return RsqlUtils.createSpecFrom(this.em, rsqlFilter, rsqlMapper);
    }

    protected String buildRsqlFilter(String rsqlFilter) {

        StringBuilder builder = new StringBuilder();

        if (isNotBlank(rsqlFilter)) {

            builder.append(rsqlFilter);
        }

        return builder.toString();
    }

    @PostConstruct
    public void afterPropertiesSet() {
        Assert.notNull(this.em, "EntityManager não foi definido.");
    }

}
