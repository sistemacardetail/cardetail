package br.com.cardetail.domain.security;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.enums.PerfilPadrao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Table(name = "perfil")
public class Perfil implements BaseDomain<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "perfil_seq_gen")
    @SequenceGenerator(
            name = "perfil_seq_gen",
            sequenceName = "perfil_seq",
            allocationSize = 1
    )
    private Long id;

    @NotBlank(message = "O nome do perfil é obrigatório!")
    @Column(nullable = false, unique = true, length = 50)
    private String nome;

    @Column(length = 200)
    private String descricao;

    @NotNull(message = "O nível do perfil é obrigatório!")
    @Column(nullable = false)
    private Integer nivel;

    @Column(nullable = false)
    private boolean ativo = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "perfil_permissao",
        joinColumns = @JoinColumn(name = "id_perfil"),
        inverseJoinColumns = @JoinColumn(name = "id_permissao")
    )
    private Set<Permissao> permissoes = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean hasPermissao(String codigo) {
        return permissoes.stream()
            .anyMatch(p -> p.getCodigo().equals(codigo));
    }

    public void addPermissao(Permissao permissao) {
        this.permissoes.add(permissao);
    }

    public void removePermissao(Permissao permissao) {
        this.permissoes.remove(permissao);
    }

    public boolean isAdministrador() {
        return PerfilPadrao.isAdministrador(this.nome);
    }
}
