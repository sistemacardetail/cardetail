package br.com.cardetail.domain;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "orcamento_servico_terceirizado")
public class OrcamentoServicoTerceirizado {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_servico_terceirizado", nullable = false)
    @JsonAlias("servicoTerceirizado")
    private ServicoTerceirizado servico;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal valor = BigDecimal.ZERO;

}
