package br.com.cardetail.config.security;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Stream;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.config.security.annotation.NoRequiresPermission;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.domain.Usuario;
import br.com.cardetail.enums.PermissaoEnum;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    private final SecurityContext securityContext;

    @Around(
            "@annotation(br.com.cardetail.config.security.annotation.RequiresPermission) || " +
                    "@within(br.com.cardetail.config.security.annotation.RequiresPermission)"
    )
    public Object checkRequiresPermission(ProceedingJoinPoint joinPoint) throws Throwable {

        Usuario usuario = securityContext.getUsuarioLogado()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário não autenticado"));

        RequiresPermission requires = resolveRequiresPermission(joinPoint);

        if (requires != null) {
            validarRequires(usuario, requires);
        }

        return joinPoint.proceed();
    }

    @Around(
            "execution(* br.com.cardetail.core.resource.FindResource+.*(..)) || " +
                    "execution(* br.com.cardetail.core.resource.BaseResource+.*(..))"
    )
    public Object checkCrudPermission(ProceedingJoinPoint joinPoint) throws Throwable {

        if (isNoRequiredPermission(joinPoint)) {
            return joinPoint.proceed();
        }

        CrudPermissions crud = resolveCrudPermissions(joinPoint);

        if (crud == null) {
            return joinPoint.proceed();
        }

        Usuario usuario = securityContext.getUsuarioLogado()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário não autenticado"));

        validarCrud(usuario, crud);

        return joinPoint.proceed();
    }

    private RequiresPermission resolveRequiresPermission(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        RequiresPermission methodAnnotation =
                method.getAnnotation(RequiresPermission.class);

        if (methodAnnotation != null) {
            return methodAnnotation;
        }

        return joinPoint.getTarget()
                .getClass()
                .getAnnotation(RequiresPermission.class);
    }

    private CrudPermissions resolveCrudPermissions(ProceedingJoinPoint joinPoint) {
        return joinPoint.getTarget()
                .getClass()
                .getAnnotation(CrudPermissions.class);
    }

    private void validarRequires(Usuario usuario,
            RequiresPermission requires) {

        Stream<String> permissoes =
                Arrays.stream(requires.value())
                        .map(PermissaoEnum::getCodigo);

        boolean autorizado = requires.operator()
                == RequiresPermission.LogicalOperator.AND
                ? permissoes.allMatch(usuario::hasPermissao)
                : permissoes.anyMatch(usuario::hasPermissao);

        if (!autorizado) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado.");
        }
    }

    private void validarCrud(Usuario usuario,
            CrudPermissions crud) {

        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes())
                        .getRequest();

        PermissaoEnum permissao = switch (request.getMethod()) {
            case "GET" -> crud.visualizar();
            case "POST" -> crud.criar();
            case "PUT", "PATCH" -> crud.atualizar();
            case "DELETE" -> crud.remover();
            default -> null;
        };

        if (permissao != null
                && !usuario.hasPermissao(permissao.getCodigo())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso negado. O usuário não possui a permissão " + permissao.getCodigo());
        }
    }

    private boolean isNoRequiredPermission(ProceedingJoinPoint joinPoint) {

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        if (method.isAnnotationPresent(NoRequiresPermission.class)) {
            return true;
        }

        return joinPoint.getTarget()
                .getClass()
                .isAnnotationPresent(NoRequiresPermission.class);
    }
}
