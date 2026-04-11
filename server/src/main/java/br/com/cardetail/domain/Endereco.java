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
@Table(name = "endereco")
public class Endereco implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Size(max = 8, message = "O CEP deve ter no máximo 8 caracteres!")
    @Column(length = 8)
    private String cep;

    @Size(max = 200, message = "O logradouro deve ter no máximo 200 caracteres!")
    @Column(length = 200)
    private String logradouro;

    @Size(max = 20, message = "O número deve ter no máximo 20 caracteres!")
    @Column(length = 20)
    private String numero;

    @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres!")
    @Column(length = 100)
    private String complemento;

    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres!")
    @Column(length = 100)
    private String bairro;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_cidade", nullable = false)
    private Cidade cidade;

    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        if (logradouro != null && !logradouro.isBlank()) {
            sb.append(logradouro);
            if (numero != null && !numero.isBlank()) {
                sb.append(", ").append(numero);
            }
            if (complemento != null && !complemento.isBlank()) {
                sb.append(" - ").append(complemento);
            }
        }
        if (bairro != null && !bairro.isBlank()) {
            if (!sb.isEmpty()) sb.append(" - ");
            sb.append(bairro);
        }
        if (cidade != null) {
            if (!sb.isEmpty()) sb.append(", ");
            sb.append(cidade.getNomeWithUf());
        }
        return sb.toString();
    }

}
