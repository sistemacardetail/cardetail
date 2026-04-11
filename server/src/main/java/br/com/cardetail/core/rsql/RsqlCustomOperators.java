package br.com.cardetail.core.rsql;

import cz.jirutka.rsql.parser.ast.ComparisonOperator;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public abstract class RsqlCustomOperators {

    public static final ComparisonOperator REMOVE_ACCENT = new ComparisonOperator("=acc=");
    public static final ComparisonOperator TRUNC = new ComparisonOperator("=t=");
    public static final ComparisonOperator DIFF_TRUNC = new ComparisonOperator("=dt=");


    public static Set<ComparisonOperator> operators() {
        return new HashSet<>(Arrays.asList(REMOVE_ACCENT, TRUNC, DIFF_TRUNC));
    }

}
