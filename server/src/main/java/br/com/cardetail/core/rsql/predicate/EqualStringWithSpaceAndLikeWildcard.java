package br.com.cardetail.core.rsql.predicate;

import br.com.cardetail.core.external.comparison.ComparisonOperatorProxy;
import br.com.cardetail.core.external.jpa.PredicateBuilder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;

import java.util.Locale;

import static java.util.Objects.isNull;

public class EqualStringWithSpaceAndLikeWildcard implements ComparisonPredicateComposite<String> {

    private static final char PERCENT_CHAR = '%';
    private static final String WHITE_SPACE = " ";

    public static EqualStringWithSpaceAndLikeWildcard create() {

        return new EqualStringWithSpaceAndLikeWildcard();
    }

    private Boolean argStartsAndEndWith(String arg, String startEnd) {
        return StringUtils.startsWith(arg, startEnd)
                && StringUtils.endsWith(arg, startEnd);
    }

    @Override public boolean accept(Expression<String> propertyPath, ComparisonOperatorProxy operator, String arg) {

        return (ComparisonOperatorProxy.EQUAL.equals(operator)
                && propertyPath.getJavaType().getCanonicalName().equals(String.class.getCanonicalName())
                && (argStartsAndEndWith(arg, PredicateBuilder.LIKE_WILDCARD.toString())) && arg.contains(WHITE_SPACE));

    }

    @Override public Predicate create(Expression<String> propertyPath, String argument, EntityManager entityManager) {

        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        Predicate predicate = null;
        String[] args = argument.split(WHITE_SPACE);

        for (String arg : args) {

            StringBuilder buffer = new StringBuilder(arg.replace(PredicateBuilder.LIKE_WILDCARD.toString(), ""));

            buffer.insert(0, PERCENT_CHAR);
            buffer.append(PERCENT_CHAR);

            String value = buffer.toString().toLowerCase(Locale.getDefault());

            Predicate likePredicate = EqualStringUnaccent.createlikeRemoveAccent(builder,propertyPath,value);

            if (isNull(predicate)) {

                predicate = likePredicate;
            } else {

                predicate = builder.and(predicate, likePredicate);
            }

        }

        return predicate;
    }

}
