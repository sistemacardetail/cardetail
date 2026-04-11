package br.com.cardetail.core.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

public final class ListUtils {

    public static Boolean safeIsEmpty(List<?> list) {
        return isNull(list) || list.isEmpty();
    }

    public static <T> Collection<T> paginate(List<T> list, int page, int size) {

        return list.stream()
                .skip((long)page * size)
                .limit(size)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public static <T> List<T> union(List<T> a, List<T> b) {
        ArrayList<T> list = new ArrayList<>();
        list.addAll(a);
        list.addAll(b);
        return list;
    }

}
