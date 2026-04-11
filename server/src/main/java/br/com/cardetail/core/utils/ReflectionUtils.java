package br.com.cardetail.core.utils;

import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.reflect.MethodUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.math.BigInteger;
import java.util.function.Function;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

public final class ReflectionUtils {

    private static final String GET_PREFIX = "get";
    private static final String SET_PREFIX = "set";


    public static <T> Class<T> getClassParameterizedType(Class<?> baseClass) {
        return getClassParameterizedType(baseClass, BigInteger.ZERO.intValue());
    }

    public static <T> Class<T> getClassParameterizedType(Class<?> baseClass, int index) {
        ParameterizedType parameterizedType = null;
        Type genericType = baseClass;

        if (!baseClass.isEnum()) {
            while (isNull(parameterizedType) && nonNull(genericType)) {

                if (genericType instanceof ParameterizedType) {

                    parameterizedType = (ParameterizedType) genericType;
                } else {

                    genericType = ((Class<?>) genericType).getGenericSuperclass();
                }
            }
        }

        if (isNull(parameterizedType)) {

            return (Class<T>) ReflectionUtils.getParameterizedInterfaceType(baseClass, index)
                    .getActualTypeArguments()[index];
        }

        return (Class<T>) parameterizedType.getActualTypeArguments()[index];
    }

    private static ParameterizedType getParameterizedInterfaceType(Type genericType, int index) {
        ParameterizedType parameterizedType = null;

        while (isNull(parameterizedType)) {

            if (genericType instanceof ParameterizedType) {

                parameterizedType = (ParameterizedType) genericType;
            } else {

                Type[] genericInterfaces = ((Class<?>) genericType).getGenericInterfaces();
                for (Type genericInterfaceType : genericInterfaces) {
                    parameterizedType = ReflectionUtils.getParameterizedInterfaceType(genericInterfaceType, index);

                    if (nonNull(parameterizedType)) {

                        break;
                    }
                }
                break;
            }
        }
        return parameterizedType;
    }

    public static Method getSetterMethod(Class<?> clazz, String field, Class<?> clazzArg, boolean throwException) {

        String methodSetName = SET_PREFIX + StringUtils.capitalize(field);

        Method method = MethodUtils.getAccessibleMethod(clazz, methodSetName, clazzArg);

        if (throwException && isNull(method)) {
            throw new IllegalArgumentException(
                    String.format("Método set não encontrado para o field %s using name %s para classe %s.",
                            field, methodSetName,
                            clazz.getName()));

        }
        return method;
    }

    public static Method getSetterMethod(Class<?> clazz, String field, Class<?> clazzArg) {

        return getSetterMethod(clazz, field, clazzArg, true);
    }

    @SneakyThrows
    public static <T, U> Function<T, U> fieldExtractor(Class<T> classType, String fieldName) {
        Field field = classType.getDeclaredField(fieldName);
        field.setAccessible(true);

        return instance -> getFieldValue(instance, field);
    }

    /**
     * Pesquisa o método pelo nome, e caso o mesmo não exista, retorna null.
     *
     * @param clazz Classe para pesquisar o método
     * @param methodName Nome final do método para ser pesquisado.
     * @return Instância de {@link Method}, ou null.
     */
    public static Method findMethod(Class<?> clazz, String methodName) {

        return MethodUtils.getAccessibleMethod(clazz, methodName);
    }

    /**
     * Pesquisa o método pelo nome, e caso o mesmo não exista uma
     * {@link IllegalArgumentException} será lançada.
     *
     * @param clazz Classe para pesquisar o método
     * @param fieldName Nome do campo a ser pesquisado.
     * @return Instância de {@link Method}, ou null.
     */
    public static Method getGetterMethod(Class<?> clazz, String fieldName) {

        final String methodGetName = GET_PREFIX + StringUtils.capitalize(fieldName);
        final Method method = findMethod(clazz, methodGetName);

        if (isNull(method)) {

            throw new IllegalArgumentException(
                    String.format("Método não encontrado com o nome %s para classe %s.",
                            fieldName, clazz.getName()));
        }
        return method;

    }

    @SneakyThrows
    public static <T> T getFieldValue(Object instance, Field field) {
        return (T) field.get(instance);
    }

}
