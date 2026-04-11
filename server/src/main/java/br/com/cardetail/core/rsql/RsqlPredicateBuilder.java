package br.com.cardetail.core.rsql;

import java.util.List;

import org.apache.commons.lang3.NotImplementedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.com.cardetail.core.external.builder.BuilderTools;
import br.com.cardetail.core.external.jpa.PredicateBuilder;
import br.com.cardetail.core.external.jpa.PredicateBuilderStrategy;
import br.com.cardetail.core.rsql.predicate.EqualStringUnaccent;
import cz.jirutka.rsql.parser.ast.ComparisonNode;
import cz.jirutka.rsql.parser.ast.Node;
import cz.jirutka.rsql.parser.ast.RSQLOperators;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Predicate;

import static java.util.Objects.isNull;

public class RsqlPredicateBuilder implements PredicateBuilderStrategy {

    private final transient Logger log = LoggerFactory.getLogger(getClass());

    @Override
    public <T> Predicate createPredicate(Node node, From root, Class<T> entity,
                                         EntityManager manager,
                                         BuilderTools tools) {

        if (isNull(root)) {
            throwIllegalArgument("From root node was undefined.");
        }

        if (!ComparisonNode.class.isAssignableFrom(node.getClass())) {
            throwIllegalArgument("Node must be ComparisonNode.");
        }

        return internalCreatePredicate(node, root, manager, tools);
    }

    private <T> Predicate internalCreatePredicate(Node node, From root,
                                                  EntityManager manager, BuilderTools tools) {
        ComparisonNode comparison = (ComparisonNode) node;

        log.debug("Creating Predicate for comparison node: {}", node);

        log.debug("Property graph path : {}", comparison.getSelector());
        Expression propertyPath = PredicateBuilder.findPropertyPath(comparison.getSelector(), root, manager, tools);

        log.debug("Cast all arguments to type {}.", propertyPath.getJavaType().getName());
        List<Object> castedArguments = tools.getArgumentParser().parse(comparison.getArguments(),
                propertyPath.getJavaType());

        return createBuilderPredicate(comparison.getOperator().getSymbol(), propertyPath,
                (Comparable) castedArguments.getFirst(), manager);

    }

    private void throwIllegalArgument(String msg) {
        log.error(msg);
        throw new IllegalArgumentException(msg);
    }

    private <Y extends Comparable<? super Object>> Predicate createBuilderPredicate(String symbol,
                                                                                    Expression<? extends Comparable> expression, Comparable value, EntityManager manager) {

        CriteriaBuilder builder = manager.getCriteriaBuilder();

        if (symbol.equals(RSQLOperators.GREATER_THAN_OR_EQUAL.getSymbol())) {

            return builder.greaterThanOrEqualTo(expression, value);

        }
        if (symbol.equals(RSQLOperators.GREATER_THAN.getSymbol())) {

            return builder.greaterThan(expression, value);

        }
        if (symbol.equals(RSQLOperators.LESS_THAN_OR_EQUAL.getSymbol())) {

            return builder.lessThanOrEqualTo(expression, value);

        }
        if (symbol.equals(RSQLOperators.LESS_THAN.getSymbol())) {

            return builder.lessThan(expression, value);

        }
        if (symbol.equals(RsqlCustomOperators.REMOVE_ACCENT.getSymbol())) {

            return EqualStringUnaccent.createlikeRemoveAccent(builder, (Expression<String>) expression, (String) value);

        }

        throw new NotImplementedException("Operator " + symbol);

    }

}
