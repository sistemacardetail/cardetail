package br.com.cardetail.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.logging.log4j.util.Strings;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.enums.StatusAgendamento;
import br.com.cardetail.enums.StatusPagamento;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import static java.util.Objects.nonNull;

@Entity
@Data
@Table(name = "agendamento")
public class Agendamento implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(unique = true, insertable = false, updatable = false)
    private Long numero;

    @ManyToOne
    @JoinColumn(name = "id_veiculo", nullable = false, updatable = false)
    @NotNull
    private Veiculo veiculo;

    @Column(name = "valor_desconto", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "data_previsao_inicio")
    private LocalDateTime dataPrevisaoInicio;

    @Column(name = "data_previsao_fim")
    private LocalDateTime dataPrevisaoFim;

    @ManyToOne
    @JoinColumn(name = "id_pacote")
    private Pacote pacote;

    @Column(name = "valor_pacote", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorPacote = BigDecimal.ZERO;

    @Column(name = "id_status")
    private StatusAgendamento status = StatusAgendamento.CONFIRMADO;

    @Column(name = "id_status_pagamento")
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_agendamento", nullable = false)
    private List<AgendamentoServico> servicos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_agendamento", nullable = false)
    private List<AgendamentoServicoTerceirizado> servicosTerceirizados = new ArrayList<>();

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Length(max = 3000, message = "A observação deve ter no máximo 3000 caracteres!")
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "id_orcamento", updatable = false)
    private Orcamento orcamento;

    public BigDecimal getValorServicos() {
        return servicos.stream()
                .map(AgendamentoServico::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getValor() {
        return valorPacote.add(getValorServicos()).add(getValorServicosTerceirizados());
    }

    public BigDecimal getValorFinal() {
        return getValor().subtract(valorDesconto);
    }

    @JsonIgnore
    public boolean hasOrcamento() {
        return nonNull(orcamento);
    }

    public String getClienteNome() {
        return nonNull(veiculo) ? veiculo.getClienteNome() : Strings.EMPTY;
    }

    public void setStatusByDate() {
        if (isCancelado()) {
            return;
        }

        final LocalDateTime dataAtual = LocalDateTime.now();

        if (dataPrevisaoFim.isBefore(dataAtual)) {
            status = StatusAgendamento.CONCLUIDO;
        }

        if (dataPrevisaoInicio.isBefore(dataAtual) && dataPrevisaoFim.isAfter(dataAtual)) {
            status = StatusAgendamento.EM_ANDAMENTO;
        }

        if (dataPrevisaoInicio.isAfter(dataAtual)) {
            status = StatusAgendamento.CONFIRMADO;
        }
    }

    public BigDecimal getValorServicosTerceirizados() {
        return servicosTerceirizados.stream()
                .map(AgendamentoServicoTerceirizado::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @JsonIgnore
    public boolean isCancelado() {
        return StatusAgendamento.CANCELADO.equals(status);
    }

    @JsonIgnore
    public boolean isPago() {
        return StatusPagamento.PAGO.equals(statusPagamento);
    }
}
