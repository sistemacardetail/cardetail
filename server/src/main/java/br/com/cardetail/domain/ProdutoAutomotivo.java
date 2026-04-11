package br.com.cardetail.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.core.json.JsonFilterFields;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@Table(name = "produto_automotivo")
@JsonFilterFields(of = {"id", "nome", "descricao", "dataCriacao",
        "marca.id", "marca.nome",
        "tipo.id", "tipo.descricao",
        "tamanho.id",
        "tamanho.unidade.id", "tamanho.unidade.nome", "tamanho.unidade.descricao",
        "tamanho.quantidade"
})
public class ProdutoAutomotivo implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo nome é obrigatório!")
    @Length(max = 100, message = "O nome deve ter no máximo 100 caracteres!")
    private String nome;

    @Length(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres!")
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "id_marca", nullable = false)
    private MarcaProdutoAutomotivo marca;

    @ManyToOne
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoProdutoAutomotivo tipo;

    @ManyToOne
    @JoinColumn(name = "id_tamanho", nullable = false)
    private TamanhoProdutoAutomotivo tamanho;

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

}
