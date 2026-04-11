package br.com.cardetail.dto.configuracao;

import java.util.UUID;

import br.com.cardetail.domain.Telefone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmpresaCreateDTO(
    @NotBlank(message = "O nome fantasia é obrigatório!")
    @Size(max = 100, message = "O nome fantasia deve ter no máximo 100 caracteres!")
    String nomeFantasia,

    @NotBlank(message = "A razão social é obrigatória!")
    @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres!")
    String razaoSocial,

    @NotBlank(message = "O CNPJ é obrigatório!")
    @Size(min = 14, max = 14, message = "O CNPJ deve ter 14 dígitos!")
    String cnpj,

    @Size(max = 8, message = "O CEP deve ter no máximo 8 caracteres!")
    String cep,

    @Size(max = 200, message = "O logradouro deve ter no máximo 200 caracteres!")
    String logradouro,

    @Size(max = 20, message = "O número deve ter no máximo 20 caracteres!")
    String numero,

    @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres!")
    String complemento,

    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres!")
    String bairro,

    UUID idCidade,

    Telefone telefone
) {}
