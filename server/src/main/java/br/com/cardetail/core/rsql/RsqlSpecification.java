package br.com.cardetail.core.rsql;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import br.com.cardetail.core.external.misc.Mapper;
import br.com.cardetail.core.rsql.predicate.RsqlJpaPredicateVisitor;
import cz.jirutka.rsql.parser.RSQLParser;
import cz.jirutka.rsql.parser.ast.ComparisonOperator;
import cz.jirutka.rsql.parser.ast.Node;
import cz.jirutka.rsql.parser.ast.RSQLOperators;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.Getter;
import lombok.NonNull;

public class RsqlSpecification<T> implements Specification<T> {

    @Getter
    private final String rsqlFilter;

    private final EntityManager em;

    @Getter
    private final Optional<Mapper> mapper;

    public RsqlSpecification(EntityManager em, String rsqlFilter) {
        this(em, rsqlFilter, Optional.empty());
    }

    public RsqlSpecification(EntityManager em, String rsqlFilter, Optional<Mapper> mapper) {
        super();
        this.em = em;
        this.rsqlFilter = rsqlFilter;
        this.mapper = mapper;
    }

    public RsqlSpecification<T> createWithNewFilter(String newRsqlFilter){
        return new RsqlSpecification<>(this.em, newRsqlFilter, this.mapper);
    }

    @Override
    public Predicate toPredicate(@NonNull Root<T> root, CriteriaQuery<?> query, @NonNull CriteriaBuilder cb) {

        RsqlJpaPredicateVisitor<T> visitor = (RsqlJpaPredicateVisitor<T>) RsqlJpaPredicateVisitor.create()
                .defineRoot(root);

        visitor.setRsqlMapper(mapper);

        visitor.setEntityClass((Class<T>) root.getJavaType());
        visitor.getBuilderTools().setArgumentParser(new RsqlArgumentParser());
        visitor.getBuilderTools().setPredicateBuilder(new RsqlPredicateBuilder());

        Set<ComparisonOperator> operators = RSQLOperators.defaultOperators();
        operators.addAll(RsqlCustomOperators.operators());

        Node rootNode = new RSQLParser(operators).parse(rsqlFilter);

        return rootNode.accept(visitor, em);

    }

}
