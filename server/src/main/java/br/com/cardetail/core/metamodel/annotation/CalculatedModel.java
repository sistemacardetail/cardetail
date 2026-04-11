package br.com.cardetail.core.metamodel.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({METHOD})
@Retention(RUNTIME)
@Documented
public @interface CalculatedModel {

    String fieldPath() default "";

    String caption() default "";

    boolean removeDot() default false;
}
