package br.com.cardetail.core.rsql.predicate;

import br.com.cardetail.core.external.comparison.ComparisonOperatorProxy;
import br.com.cardetail.core.external.jpa.JpaPredicateVisitor;
import br.com.cardetail.core.external.jpa.PredicateBuilder;
import br.com.cardetail.core.external.misc.Mapper;
import cz.jirutka.rsql.parser.ast.AndNode;
import cz.jirutka.rsql.parser.ast.ComparisonNode;
import cz.jirutka.rsql.parser.ast.LogicalNode;
import cz.jirutka.rsql.parser.ast.LogicalOperator;
import cz.jirutka.rsql.parser.ast.Node;
import cz.jirutka.rsql.parser.ast.OrNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.util.Objects.nonNull;

@RequiredArgsConstructor( access = AccessLevel.PRIVATE)
public class RsqlJpaPredicateVisitor<T> extends JpaPredicateVisitor<T> {

    private final transient Logger log = LoggerFactory.getLogger(getClass());

    private From<?, ?> root;

    @Setter
    private Optional<Mapper> rsqlMapper = Optional.empty();

    private final List<ComparisonPredicateComposite<?>> listComparisonPredicateComposite;

    public static RsqlJpaPredicateVisitor create() {
        return new RsqlJpaPredicateVisitor(List.of(EqualStringWithSpaceAndLikeWildcard.create(),
                EqualStringUnaccent.create()));
    }

    public void setEntityClass(Class<T> clazz) {
        entityClass = clazz;
    }

    @Override
    public Predicate visit(ComparisonNode node, EntityManager entityManager) {

        return createComparisonPredicate(node, entityManager);

    }

    @Override
    public Predicate visit(AndNode node, EntityManager entityManager) {
        return createLogicalPredicate(node, entityManager);
    }

    @Override
    public Predicate visit(OrNode node, EntityManager entityManager) {
        return createLogicalPredicate(node, entityManager);
    }

    private Predicate createComparisonPredicate(ComparisonNode node, EntityManager entityManager) {
        try {

            ComparisonOperatorProxy operator = getOperatorEnum(node);
            String arg = node.getArguments().getFirst();
            Expression<?> propertyPath = PredicateBuilder.findPropertyPath(node.getSelector(), root, entityManager,
                    getBuilderTools());

            for (ComparisonPredicateComposite comparisonPredicateComposite : listComparisonPredicateComposite) {

                if (comparisonPredicateComposite.accept(propertyPath, operator, arg)) {

                    return comparisonPredicateComposite.create(propertyPath, arg, entityManager);
                }

            }

            ComparisonNode newNode = node;
            if (this.rsqlMapper.isPresent()) {
                String translatedSelector = this.rsqlMapper.get().translate(node.getSelector(),
                        entityClass);
                newNode = node.withSelector(translatedSelector);
            }
            return PredicateBuilder.createPredicate(newNode, root, entityClass, entityManager, getBuilderTools());

        } catch (ClassCastException e) {
            if (nonNull(builderTools.getPredicateBuilder())) {
                return builderTools.getPredicateBuilder().createPredicate(node, root, entityClass, entityManager,
                        getBuilderTools());
            }
            throw e;
        }

    }

    private ComparisonOperatorProxy getOperatorEnum(ComparisonNode node) {
        return ComparisonOperatorProxy.asEnum(node.getOperator());
    }

    @Override
    public JpaPredicateVisitor<T> defineRoot(From root) {
        this.root = root;
        return super.defineRoot(root);
    }

    public Predicate createLogicalPredicate(LogicalNode logical, EntityManager entityManager) {

        log.debug("Creating Predicate for logical node: {}", logical);

        CriteriaBuilder builder = entityManager.getCriteriaBuilder();

        List<Predicate> predicates = new ArrayList<>();

        log.debug("Creating Predicates from all children nodes.");

        for (Node node : logical.getChildren()) {

            if (LogicalNode.class.isAssignableFrom(node.getClass())) {

                predicates.add(createLogicalPredicate((LogicalNode) node, entityManager));

            } else if (ComparisonNode.class.isAssignableFrom(node.getClass())) {

                predicates.add(createComparisonPredicate((ComparisonNode) node, entityManager));

            }

        }

        if (logical.getOperator() == LogicalOperator.AND) {
            return builder.and(predicates.toArray(new Predicate[0]));
        }

        if (logical.getOperator() == LogicalOperator.OR)
            return builder.or(predicates.toArray(new Predicate[0]));

        throw new IllegalArgumentException("Unknown operator: " + logical.getOperator());
    }

}
