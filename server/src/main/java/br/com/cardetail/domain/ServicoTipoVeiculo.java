package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@Table(name = "servico_tipo_veiculo")
public class ServicoTipoVeiculo implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_tipo", nullable = false)
    @NotNull
    private TipoVeiculo tipo;

}
