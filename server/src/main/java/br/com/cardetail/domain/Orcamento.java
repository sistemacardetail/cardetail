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
import br.com.cardetail.enums.StatusOrcamento;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

import static java.util.Objects.nonNull;

@Entity
@Data
@Table(name = "orcamento")
public class Orcamento implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(unique = true, insertable = false, updatable = false)
    private Long numero;

    @ManyToOne
    @JoinColumn(name = "id_veiculo", nullable = false, updatable = false)
    private Veiculo veiculo;

    @Column(name = "valor_desconto", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "id_pacote")
    private Pacote pacote;

    @Column(name = "valor_pacote", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorPacote = BigDecimal.ZERO;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_orcamento", nullable = false)
    private List<OrcamentoServico> servicos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_orcamento", nullable = false)
    private List<OrcamentoServicoTerceirizado> servicosTerceirizados = new ArrayList<>();

    @Column(name = "data_criacao", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Length(max = 3000, message = "A observação deve ter no máximo 3000 caracteres!")
    private String observacao;

    @Column(name = "id_status")
    private StatusOrcamento status = StatusOrcamento.PENDENTE;

    public BigDecimal getValorServicos() {
        return servicos.stream()
                .map(OrcamentoServico::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getValorServicosTerceirizados() {
        return servicosTerceirizados.stream()
                .map(OrcamentoServicoTerceirizado::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getValor() {
        return valorPacote.add(getValorServicos()).add(getValorServicosTerceirizados());
    }

    public BigDecimal getValorFinal() {
        return getValor().subtract(valorDesconto);
    }

    @JsonIgnore
    public boolean notIsPendente() {
        return !StatusOrcamento.PENDENTE.equals(status);
    }

    @JsonIgnore
    public boolean isAgendado() {
        return StatusOrcamento.AGENDADO.equals(status);
    }

    public String getClienteNome() {
        return nonNull(veiculo) ? veiculo.getClienteNome() : Strings.EMPTY;
    }

}
