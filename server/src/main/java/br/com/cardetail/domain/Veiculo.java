package br.com.cardetail.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import static java.util.Objects.nonNull;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Entity
@Data
@Table(name = "veiculo")
public class Veiculo implements BaseDomain<UUID>  {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false, insertable = false, updatable = false)
    @JsonIgnore
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "id_modelo", nullable = false)
    @NotNull
    private ModeloVeiculo modelo;

    @ManyToOne
    @JoinColumn(name = "id_cor", nullable = false)
    @NotNull
    private CorVeiculo cor;

    @Column(length = 7)
    private String placa;

    @Length(max = 3000, message = "A observação deve ter no máximo 3000 caracteres!")
    private String observacao;

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @NotNull
    private boolean ativo = true;

    @JsonIgnore
    public TipoVeiculo getTipo() {
        return nonNull(modelo) ? modelo.getTipo() : null;
    }

    @JsonIgnore
    public MarcaVeiculo getMarca() {
        return nonNull(modelo) ? modelo.getMarca() : null;
    }

    public String getPlacaFormatted() {
        if (isBlank(placa)) {
            return "sem placa";
        }
        return placa.substring(0, 3) + "-" + placa.substring(3);
    }

    public boolean hasPlaca() {
        return isNotBlank(placa);
    }

    @JsonIgnore
    public String getClienteNome() {
        return nonNull(cliente) ? cliente.getNome() : null;
    }

    @JsonIgnore
    public UUID getClienteId() {
        return nonNull(cliente) ? cliente.getId() : null;
    }

    public boolean getSemPlaca() {
        return isBlank(placa);
    }

    @JsonIgnore
    public String getMarcaAndModelo() {
        return nonNull(modelo) && nonNull(modelo.getMarca())
                ? String.format("%s %s", modelo.getMarca().getNome(), modelo.getNome())
                : EMPTY;
    }
}
