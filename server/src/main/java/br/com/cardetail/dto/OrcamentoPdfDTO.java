package br.com.cardetail.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para geração de PDF do orçamento.
 * Contém todos os dados necessários para o documento impresso.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoPdfDTO {

    // Dados da empresa
    private String empresaNome;
    private String empresaLogo; // URL ou Base64
    private String empresaEndereco;
    private String empresaTelefone;
    private String empresaCnpj;

    // Dados do orçamento
    private Long numero;
    private LocalDateTime dataCriacao;
    private String status;

    // Dados do cliente
    private String clienteNome;
    private String clienteTelefone;
    private String veiculoDescricao;
    private String veiculoPlaca;

    // Pacote
    private String pacoteNome;
    private String pacoteDescricao;
    private BigDecimal pacoteValor;

    // Serviços do pacote
    private List<ServicoItemDTO> servicosPacote;

    // Serviços adicionais
    private List<ServicoItemDTO> servicosAdicionais;

    // Valores
    private BigDecimal valorTotal;
    private BigDecimal valorDesconto;
    private BigDecimal valorFinal;

    // Observação
    private String observacao;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicoItemDTO {
        private String nome;
        private String descricao;
        private BigDecimal valor;
    }

}
