package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@Table(name = "cor_veiculo")
public class CorVeiculo implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo nome é obrigatório!")
    @Length(max = 50, message = "O nome deve ter no máximo 50 caracteres!")
    private String nome;

}
