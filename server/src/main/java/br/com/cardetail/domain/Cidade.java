package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
@Table(name = "cidade")
public class Cidade implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres!")
    @Column(length = 100)
    private String nome;

    @Column(name = "codigo_ibge", length = 20)
    private String codigoIBGE;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_uf", nullable = false)
    private Uf uf;

    public String getNomeWithUf() {
        return String.format("%s/%s", nome, uf.getSigla());
    }
}
