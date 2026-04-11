package br.com.cardetail.core.enumsupport;

public interface EnumConverter<T extends Enum<T>, V> {

    V getValue();

    String getDescricao();

}
