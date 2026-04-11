package br.com.cardetail.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.Length;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.domain.security.Perfil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "usuario")
@NoArgsConstructor
public class Usuario implements BaseDomain<UUID> {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank(message = "O campo nome é obrigatório!")
    @Length(max = 50, message = "O nome deve ter no máximo 50 caracteres!")
    @Column(nullable = false, unique = true)
    private String nome;

    @NotBlank(message = "O campo login é obrigatório!")
    @Length(max = 50, message = "O login deve ter no máximo 50 caracteres!")
    @Column(nullable = false, unique = true)
    private String login;

    @NotBlank(message = "O campo senha é obrigatório!")
    @JsonIgnore
    private String senha;

    @NotNull(message = "O perfil é obrigatório!")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_perfil", nullable = false)
    private Perfil perfil;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(nullable = false, updatable = false)
    private boolean admin = false;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "attempts_login", nullable = false)
    private int attemptsLogin = 0;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    public boolean isBloqueado() {
        return blockedAt != null && LocalDateTime.now().isBefore(blockedAt);
    }

    public void increaseAttemptsLogin() {
        this.attemptsLogin++;
    }

    public void resetAttrmptsLogin() {
        this.attemptsLogin = 0;
        this.blockedAt = null;
    }

    public void blockByMinutes(int minutes) {
        this.blockedAt = LocalDateTime.now().plusMinutes(minutes);
    }

    public void registrarLogin() {
        this.lastLogin = LocalDateTime.now();
        this.attemptsLogin = 0;
        this.blockedAt = null;
    }

    public boolean hasPermissao(String codigo) {
        if (admin) return true;
        return perfil != null && perfil.hasPermissao(codigo);
    }

    @JsonIgnore
    public String getPerfilNome() {
        return perfil != null ? perfil.getNome() : "";
    }
}
