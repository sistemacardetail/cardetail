package br.com.cardetail.domain;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "logo_empresa")
public class LogoEmpresa implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "imagem", columnDefinition = "BYTEA")
    private byte[] imagem;

    @Column(name = "content_type", length = 100)
    private String contentType;

}
