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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Slf4j
@Entity
@Data
@NoArgsConstructor
@Table(name = "empresa")
public class Empresa implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O nome fantasia é obrigatório!")
    @Size(max = 100, message = "O nome fantasia deve ter no máximo 100 caracteres!")
    @Column(name = "nome_fantasia", nullable = false, length = 100)
    private String nomeFantasia;

    @NotBlank(message = "A razão social é obrigatória!")
    @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres!")
    @Column(name = "razao_social", nullable = false, length = 150)
    private String razaoSocial;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_endereco")
    private Endereco endereco;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_telefone")
    private Telefone telefone;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_logo")
    private LogoEmpresa logo;

    public String getEnderecoCompleto() {
        return nonNull(endereco) ? endereco.getEnderecoCompleto() : EMPTY;
    }

    public String getCnpjFormatado() {
        if (cnpj == null || cnpj.length() != 14) return cnpj;
        return cnpj.substring(0, 2) + "." + cnpj.substring(2, 5) + "." +
               cnpj.substring(5, 8) + "/" + cnpj.substring(8, 12) + "-" +
               cnpj.substring(12, 14);
    }

    public boolean hasLogo() {
        return nonNull(logo) && nonNull(logo.getImagem()) && logo.getImagem().length > 0;
    }

    public void setLogoBy(final byte[] imagem, final String contentType) {
        if (isNull(logo)) {
            logo = new LogoEmpresa();
        }

        logo.setImagem(imagem);
        logo.setContentType(contentType);
    }
}
