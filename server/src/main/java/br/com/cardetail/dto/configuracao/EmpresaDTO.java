package br.com.cardetail.dto.configuracao;

import java.util.UUID;

public record EmpresaDTO(
    UUID id,
    String nomeFantasia,
    String razaoSocial,
    String cnpj,
    String cnpjFormatado,
    String cep,
    String logradouro,
    String numero,
    String complemento,
    String bairro,
    UUID idCidade,
    String cidade,
    String estado,
    String enderecoCompleto,
    String telefone,
    boolean temLogo
) {}
