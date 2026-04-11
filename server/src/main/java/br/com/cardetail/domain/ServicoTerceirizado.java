package br.com.cardetail.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@Table(name = "servico_terceirizado")
public class ServicoTerceirizado implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo nome é obrigatório!")
    @Length(max = 100, message = "O nome deve ter no máximo 100 caracteres!")
    private String nome;

    @Length(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres!")
    private String descricao;

    @Length(max = 3000, message = "A observação deve ter no máximo 3000 caracteres!")
    private String observacao;

    @NotNull
    private boolean ativo = true;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_fornecedor")
    private FornecedorServico fornecedor;

    @NotEmpty(message = "Informe pelo menos um tipo de veículo que o serviço terceirizado atende!")
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_servico_terceirizado", nullable = false)
    private List<ServicoTerceirizadoTipoVeiculo> tiposVeiculos = new ArrayList<>();

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

}
