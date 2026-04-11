package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
@Table(name = "uf")
public class Uf implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres!")
    @Column(length = 100)
    private String nome;

    @Column(length = 2)
    private String sigla;
}
