package br.com.cardetail.core.utils;

import br.com.cardetail.core.external.misc.Mapper;
import br.com.cardetail.core.rsql.RsqlSpecification;
import jakarta.persistence.EntityManager;
import org.springframework.data.jpa.domain.Specification;

import java.util.Optional;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

public final class RsqlUtils {

    public static <T> Specification<T> createSpecFrom(EntityManager em, String rsqlFilter) {

        return createSpecFrom(em, rsqlFilter, Optional.empty());
    }

    public static <T> Specification<T> createSpecFrom(EntityManager em, String rsqlFilter,
                                                      Optional<Mapper> rsqlMapper) {
        if (isNotBlank(rsqlFilter)) {

            return new RsqlSpecification<>(em, rsqlFilter, rsqlMapper);
        }

        return (root, query, cb) -> cb.conjunction();
    }

}
