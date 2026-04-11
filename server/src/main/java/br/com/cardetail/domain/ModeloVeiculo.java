package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@Table(name = "modelo_veiculo")
public class ModeloVeiculo implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo nome é obrigatório!")
    @Length(max = 100, message = "O nome deve ter no máximo 100 caracteres!")
    private String nome;

    @ManyToOne
    @JoinColumn(name = "id_marca", nullable = false)
    @NotNull(message = "Informa a marca do veículo!")
    private MarcaVeiculo marca;

    @ManyToOne
    @JoinColumn(name = "id_tipo", nullable = false)
    @NotNull(message = "Informa o tipo do veículo!")
    private TipoVeiculo tipo;

}
