package br.com.cardetail.domain.security;

import br.com.cardetail.core.domain.BaseDomain;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Table(name = "permissao")
public class Permissao implements BaseDomain<Long> {

    @Id
    private Long id;

    @NotBlank(message = "O código da permissão é obrigatório!")
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(length = 200)
    private String descricao;

    @NotBlank(message = "O módulo da permissão é obrigatório!")
    @Column(nullable = false, length = 50)
    private String modulo;
}
