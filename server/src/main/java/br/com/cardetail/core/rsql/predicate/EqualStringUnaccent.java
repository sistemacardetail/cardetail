package br.com.cardetail.core.rsql.predicate;

import br.com.cardetail.core.external.comparison.ComparisonOperatorProxy;
import br.com.cardetail.core.external.jpa.PredicateBuilder;
import br.com.cardetail.core.rsql.annotation.RsqlUseUnaccent;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.reflect.FieldUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

public class EqualStringUnaccent implements ComparisonPredicateComposite<String> {

    private static final List<String> ACCEPTABLE_NAMES = List.of("nome", "descricao");

    private static final String FUNCTION_REMOVE_ACENTO = "removeAcento";

    public static EqualStringUnaccent create() {

        return new EqualStringUnaccent();
    }

    @Override public boolean accept(Expression<String> propertyPath, ComparisonOperatorProxy operator, String arg) {

        return (ComparisonOperatorProxy.EQUAL.equals(operator)
                && propertyPath.getJavaType().getCanonicalName().equals(String.class.getCanonicalName())
                && isAcceptableProperty(propertyPath));

    }

    private boolean isAcceptableProperty(Expression<String> propertyPath) {
        try {

            String pathString = propertyPath.toString();

            String[] parts = pathString.split("\\.");

            String propertyName = parts[parts.length - 1];

            Class<?> declaringClass = propertyPath.getJavaType();

            Field field = FieldUtils.getField(declaringClass, propertyName, true);

            return Objects.nonNull(field) &&
                    (ACCEPTABLE_NAMES.contains(propertyName.toLowerCase(Locale.getDefault())) ||
                            field.isAnnotationPresent(RsqlUseUnaccent.class));

        } catch (Exception e) {

            return false;
        }
    }

    @Override public Predicate create(Expression<String> propertyPath, String argument, EntityManager entityManager) {

        CriteriaBuilder builder = entityManager.getCriteriaBuilder();

        return createlikeRemoveAccent(builder, propertyPath, argument);

    }

    public static Predicate createlikeRemoveAccent(CriteriaBuilder builder, Expression<String> expression,
                                                   String value) {

        String like = value.replace(PredicateBuilder.LIKE_WILDCARD, '%');

        return builder.like(builder.lower(builder.function(FUNCTION_REMOVE_ACENTO, String.class, expression)),
                builder.lower(builder.function(FUNCTION_REMOVE_ACENTO, String.class, builder.literal(like))));
    }

}
