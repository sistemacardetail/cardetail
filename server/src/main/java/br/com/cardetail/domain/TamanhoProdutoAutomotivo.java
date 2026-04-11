package br.com.cardetail.domain;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Data
@Table(name = "tamanho_produto_automotivo")
public class TamanhoProdutoAutomotivo implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_unidade", nullable = false)
    @NotNull
    private UnidadeProduto unidade;

    @NotNull
    @Positive(message = "A quantidade deve ser maior do que zero!")
    private BigDecimal quantidade;

    @JsonIgnore
    public String getDescricao() {
        return String.format("%s %s", quantidade, unidade.getNome());
    }

}
