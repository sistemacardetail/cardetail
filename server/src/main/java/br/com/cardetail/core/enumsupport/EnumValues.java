package br.com.cardetail.core.enumsupport;

import com.google.common.collect.Lists;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.util.Objects.isNull;

@Getter
public class EnumValues<E extends Enum<E>, V> {

    private final Map<V, EnumValue<E, V>> values = new LinkedHashMap<>();

    public E getEnum(V value) {

        if (isNull(value) || !values.containsKey(value)) {

            return null;
        }

        return values.get(value).getValue();
    }

    public void add(V value, EnumValue<E, V> enumValue) {
        this.values.put(value, enumValue);
    }

    public List<EnumValue<E, V>> getListValues() {
        return Lists.newArrayList(values.values());
    }
}
