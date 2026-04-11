package br.com.cardetail.core.utils;

import br.com.cardetail.core.enumsupport.EnumConverter;
import br.com.cardetail.core.enumsupport.EnumValue;
import br.com.cardetail.core.enumsupport.EnumValues;

import java.util.LinkedHashMap;
import java.util.Map;

public final class EnumUtils {

    public static <K, E extends Enum<E> & EnumConverter<E, K>> Map<K, E> getEnumMap(Class<E> enumClass) {
        final Map<K, E> map = new LinkedHashMap<>();
        for (final E e : enumClass.getEnumConstants()) {
            map.put(e.getValue(), e);
        }
        return map;
    }

    public static <K, E extends Enum<E> & EnumConverter<E, K>> EnumValues<E, K> getEnumValuesMap(Class<E> enumClass) {
        final EnumValues<E, K> map = new EnumValues<>();
        for (final E e : enumClass.getEnumConstants()) {
            map.add(e.getValue(), new EnumValue<>(e.getValue(), e.getDescricao(), e));
        }
        return map;
    }

    public static <V, E extends EnumConverter<?, V>> Class<V> getTypeOf(Class<E> enumClass) {

        return ReflectionUtils.getClassParameterizedType(enumClass, 1);
    }

    public static <E extends Enum<E> & EnumConverter<?, ?>> E getEnumFromValue(Class<E> enumClass, Object value) {
        for (final E e : enumClass.getEnumConstants()) {
            if (e.getValue().equals(value)) {
                return e;
            }
        }
        return null;
    }

}
