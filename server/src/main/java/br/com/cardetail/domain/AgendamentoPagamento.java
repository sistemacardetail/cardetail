package br.com.cardetail.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.enums.FormaPagamento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Data
@Table(name = "agendamento_pagamento")
public class AgendamentoPagamento implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "id_agendamento", nullable = false)
    private UUID idAgendamento;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "id_agendamento", insertable = false, updatable = false)
    @JsonIgnore
    private Agendamento agendamento;

    @Column(name = "valor_pago", precision = 18, scale = 2, nullable = false)
    @NotNull(message = "O valor pago é obrigatório!")
    @Positive(message = "O valor pago deve ser maior que zero!")
    private BigDecimal valorPago;

    @Column(name = "data_recebimento", nullable = false)
    @NotNull(message = "A data de recebimento é obrigatória!")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataRecebimento;

    @Column(name = "id_forma_pagamento", nullable = false)
    @NotNull(message = "A forma de pagamento é obrigatória!")
    private FormaPagamento formaPagamento;

    @Length(max = 500, message = "A observação deve ter no máximo 500 caracteres!")
    private String observacao;

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "created_by")
    private UUID createdBy;
}
