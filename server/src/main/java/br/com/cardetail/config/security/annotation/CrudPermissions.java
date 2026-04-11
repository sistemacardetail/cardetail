package br.com.cardetail.config.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import br.com.cardetail.enums.PermissaoEnum;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface CrudPermissions {

    PermissaoEnum visualizar();

    PermissaoEnum criar();

    PermissaoEnum atualizar();

    PermissaoEnum remover();

}
