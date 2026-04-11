package br.com.cardetail.config.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import br.com.cardetail.enums.PermissaoEnum;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {

    PermissaoEnum[] value();

    LogicalOperator operator() default LogicalOperator.OR;

    enum LogicalOperator {
        AND, OR
    }
}
