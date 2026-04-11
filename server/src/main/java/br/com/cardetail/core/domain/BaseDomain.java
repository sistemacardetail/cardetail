package br.com.cardetail.core.domain;

import java.io.Serializable;

public interface BaseDomain<K extends Serializable> {

    K getId();

    void setId(K id);

}
