package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
@Table(name = "configuracao_sistema")
public class ConfiguracaoSistema implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "A chave é obrigatória")
    @Size(max = 100, message = "A chave deve ter no máximo 100 caracteres")
    @Column(length = 100, nullable = false, unique = true)
    private String key;

    @Size(max = 500, message = "O valor deve ter no máximo 500 caracteres")
    @Column(length = 500)
    private String valor;

    @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres")
    @Column(length = 200)
    private String descricao;

}
