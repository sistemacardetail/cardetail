package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Entity
@Data
@Table(name = "telefone")
public class Telefone implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo DDD é obrigatório!")
    @Pattern(regexp = "\\d{2}", message = "O DDD deve conter exatamente 2 dígitos numéricos.")
    @Column(length = 2)
    private String ddd;

    @NotBlank(message = "O campo telefone é obrigatório!")
    @Pattern(regexp = "\\d{8,9}", message = "O telefone deve conter 8 ou 9 dígitos numéricos.")
    @Column(length = 9)
    private String numero;

    @JsonIgnore
    public String getNumeroFormatado() {
        return String.format("(%s) %s", ddd, numero);
    }

}
