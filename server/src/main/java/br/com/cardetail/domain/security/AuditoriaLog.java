package br.com.cardetail.domain.security;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "auditoria_log")
public class AuditoriaLog implements BaseDomain<UUID> {

    public enum Acao {
        CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGE
    }

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "usuario_nome", length = 100)
    private String usuarioNome;

    @NotNull(message = "A ação é obrigatória!")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Acao acao;

    @NotBlank(message = "A entidade é obrigatória!")
    @Column(nullable = false, length = 100)
    private String entidade;

    @Column(name = "entidade_id")
    private UUID entidadeId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dados_anteriores", columnDefinition = "jsonb")
    private String dadosAnteriores;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dados_novos", columnDefinition = "jsonb")
    private String dadosNovos;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static AuditoriaLog criar(Acao acao, String entidade) {
        AuditoriaLog log = new AuditoriaLog();
        log.setAcao(acao);
        log.setEntidade(entidade);
        return log;
    }

    public AuditoriaLog comUsuario(UUID usuarioId, String nome) {
        this.usuarioId = usuarioId;
        this.usuarioNome = nome;
        return this;
    }

    public AuditoriaLog comEntidadeId(UUID entidadeId) {
        this.entidadeId = entidadeId;
        return this;
    }

    public AuditoriaLog comDados(String dadosAnteriores, String dadosNovos) {
        this.dadosAnteriores = dadosAnteriores;
        this.dadosNovos = dadosNovos;
        return this;
    }

    public AuditoriaLog comRequestInfo(String ipAddress, String userAgent) {
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        return this;
    }
}
