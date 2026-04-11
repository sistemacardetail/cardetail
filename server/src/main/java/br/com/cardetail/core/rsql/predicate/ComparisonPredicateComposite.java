package br.com.cardetail.core.rsql.predicate;

import br.com.cardetail.core.external.comparison.ComparisonOperatorProxy;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

public interface ComparisonPredicateComposite<T> {

    boolean accept(Expression<T> propertyPath, ComparisonOperatorProxy operator, String arg);

    Predicate create(Expression<T> propertyPath, String argument, EntityManager entityManager);
}
