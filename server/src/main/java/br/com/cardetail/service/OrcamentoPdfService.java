package br.com.cardetail.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

import br.com.cardetail.core.exception.RestException;
import br.com.cardetail.domain.Cliente;
import br.com.cardetail.domain.Orcamento;
import br.com.cardetail.domain.PacoteServico;
import br.com.cardetail.dto.OrcamentoPdfDTO;
import br.com.cardetail.dto.OrcamentoPdfDTO.ServicoItemDTO;
import br.com.cardetail.dto.configuracao.EmpresaDTO;
import br.com.cardetail.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static java.util.Objects.nonNull;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrcamentoPdfService {

    private final ClienteRepository clienteRepository;
    private final EmpresaService empresaService;

    /**
     * Gera o PDF do orçamento.
     */
    public byte[] gerarPdf(Orcamento orcamento) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(36, 36, 36, 36);

            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // Cabeçalho
            adicionarCabecalho(document, fontBold, fontRegular);

            // Informações do orçamento
            adicionarInfoOrcamento(document, orcamento, fontBold);

            // Informações do cliente/veículo
            adicionarInfoCliente(document, orcamento, fontBold, fontRegular);

            // Pacote e serviços
            adicionarServicos(document, orcamento, fontBold, fontRegular);

            // Valores
            adicionarValores(document, orcamento, fontBold, fontRegular);

            // Observações
            if (orcamento.getObservacao() != null && !orcamento.getObservacao().isEmpty()) {
                adicionarObservacoes(document, orcamento, fontBold, fontRegular);
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erro ao gerar PDF do orçamento: {}", e.getMessage(), e);
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gerar PDF do orçamento");
        }
    }

    /**
     * Monta os dados do orçamento para preview no frontend.
     */
    public OrcamentoPdfDTO montarDadosPdf(Orcamento orcamento) {
        // Buscar cliente
        String clienteNome = "";
        String clienteTelefone = "";

        if (orcamento.getVeiculo() != null) {
            Cliente cliente = clienteRepository.findByVeiculoId(orcamento.getVeiculo().getId()).orElse(null);
            if (cliente != null) {
                clienteNome = cliente.getNome();
                if (cliente.getTelefones() != null && !cliente.getTelefones().isEmpty()) {
                    clienteTelefone = cliente.getTelefones().getFirst().getNumero();
                }
            }
        }

        // Serviços do pacote
        List<ServicoItemDTO> servicosPacote = new ArrayList<>();
        if (orcamento.getPacote().getServicos() != null) {
            for (PacoteServico ps : orcamento.getPacote().getServicos()) {
                servicosPacote.add(ServicoItemDTO.builder()
                        .nome(ps.getServico().getNome())
                        .descricao(ps.getServico().getDescricao())
                        .valor(ps.getServico().getValor())
                        .build());
            }
        }

        // Serviços adicionais
        List<ServicoItemDTO> servicosAdicionais = orcamento.getServicos()
                .stream()
                .map(sa -> ServicoItemDTO.builder()
                        .nome(sa.getServico().getNome())
                        .descricao(sa.getServico().getDescricao())
                        .valor(sa.getValor())
                        .build())
                .toList();

        // Descrição do veículo
        String veiculoDescricao = null;
        String veiculoPlaca = null;
        if (orcamento.getVeiculo() != null) {
            veiculoDescricao = orcamento.getVeiculo().getModelo().getMarca().getNome() + " " +
                              orcamento.getVeiculo().getModelo().getNome();
            veiculoPlaca = orcamento.getVeiculo().getPlacaFormatted();
        }

        final EmpresaDTO empresa = empresaService.buscar();

        return OrcamentoPdfDTO.builder()
                .empresaNome(nonNull(empresa) ? empresa.nomeFantasia() : EMPTY)
                .empresaEndereco(nonNull(empresa) ?empresa.enderecoCompleto() : EMPTY)
                .empresaTelefone(nonNull(empresa) ?empresa.telefone() : EMPTY)
                .empresaCnpj(nonNull(empresa) ? empresa.cnpjFormatado() : EMPTY)
                .numero(orcamento.getNumero())
                .dataCriacao(orcamento.getDataCriacao())
                .status(orcamento.getStatus().name())
                .clienteNome(clienteNome)
                .clienteTelefone(clienteTelefone)
                .veiculoDescricao(veiculoDescricao)
                .veiculoPlaca(veiculoPlaca)
                .pacoteNome(orcamento.getPacote().getNome())
                .pacoteDescricao(orcamento.getPacote().getDescricao())
                .pacoteValor(orcamento.getValorPacote())
                .servicosPacote(servicosPacote)
                .servicosAdicionais(servicosAdicionais)
                .valorTotal(orcamento.getValor())
                .valorDesconto(orcamento.getValorDesconto())
                .valorFinal(orcamento.getValorFinal())
                .observacao(orcamento.getObservacao())
                .build();
    }

    private void adicionarCabecalho(Document document, PdfFont fontBold, PdfFont fontRegular) {
        final EmpresaDTO empresa = empresaService.buscar();
        final byte[] logo = nonNull(empresa) && empresa.temLogo() ? empresaService.getLogo(empresa.id()) : null;

        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 3}))
                .useAllAvailableWidth();

        if (nonNull(logo)) {
            ImageData imageData = ImageDataFactory.create(logo);
            Image imageLogo = new Image(imageData)
                    .scaleToFit(60, 60);

            Cell logoCell = new Cell()
                    .add(imageLogo)
                    .setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE);

            headerTable.addCell(logoCell);
        } else {
            headerTable.addCell(new Cell().setBorder(Border.NO_BORDER));
        }

        Cell infoCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT);

        if (nonNull(empresa)) {
            infoCell.add(new Paragraph(empresa.nomeFantasia())
                    .setFont(fontBold)
                    .setFontSize(18));

            if (isNotBlank(empresa.enderecoCompleto())) {
                infoCell.add(new Paragraph(empresa.enderecoCompleto())
                        .setFont(fontRegular)
                        .setFontSize(10));
            }

            if (isNotBlank(empresa.telefone())) {
                infoCell.add(new Paragraph(empresa.telefone())
                        .setFont(fontRegular)
                        .setFontSize(10));
            }
        }

        headerTable.addCell(infoCell);

        document.add(headerTable);

        Table linha = new Table(1).useAllAvailableWidth();
        linha.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(ColorConstants.GRAY, 1))
                .setHeight(1));

        document.add(linha);
        document.add(new Paragraph().setMarginBottom(10));
    }

    private void adicionarInfoOrcamento(Document document, Orcamento orcamento,
                                         PdfFont fontBold) {
        // Título
        document.add(new Paragraph(String.format("ORÇAMENTO %06d", orcamento.getNumero()))
                .setFont(fontBold)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10));

        // Informações em tabela
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setMarginBottom(15);

        document.add(table);
    }

    private void adicionarInfoCliente(Document document, Orcamento orcamento,
                                       PdfFont fontBold, PdfFont fontRegular) {
        document.add(new Paragraph("DADOS DO CLIENTE")
                .setFont(fontBold)
                .setFontSize(12)
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(5)
                .setMarginBottom(10));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1}))
                .useAllAvailableWidth()
                .setMarginBottom(15);

        String clienteNome = "";

        if (orcamento.getVeiculo() != null) {
            Cliente cliente = clienteRepository.findByVeiculoId(orcamento.getVeiculo().getId()).orElse(null);
            if (cliente != null) {
                clienteNome = cliente.getNome();
            }
        }

        final String labelCliente = String.format("Cliente: %s",  clienteNome);
        table.addCell(createValueCell(labelCliente, fontRegular));

        if (orcamento.getVeiculo() != null) {
            final String labelVeiculo = String.format("Veículo: %s %s",
                    orcamento.getVeiculo().getModelo().getMarca().getNome(),
                    orcamento.getVeiculo().getModelo().getNome());

            table.addCell(createValueCell(labelVeiculo, fontRegular));

            final String labelPlaca = String.format("Placa: %s", orcamento.getVeiculo().getPlacaFormatted());
            table.addCell(createValueCell(labelPlaca, fontRegular));
        }

        document.add(table);
    }

    private void adicionarServicos(Document document, Orcamento orcamento,
                                    PdfFont fontBold, PdfFont fontRegular) {
        document.add(new Paragraph("SERVIÇOS")
                .setFont(fontBold)
                .setFontSize(12)
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(5)
                .setMarginBottom(10));

        if (nonNull(orcamento.getPacote())) {
            Table pacoteTable = new Table(UnitValue.createPercentArray(new float[] {4, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(5);

            pacoteTable.addCell(new Cell()
                    .add(new Paragraph(orcamento.getPacote().getNome())
                            .setFont(fontBold)
                            .setFontSize(11))
                    .setBorder(Border.NO_BORDER)
                    .setPaddingBottom(1));

            pacoteTable.addCell(new Cell()
                    .add(new Paragraph(formatarValor(orcamento.getValorPacote()))
                            .setFont(fontBold)
                            .setFontSize(11))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(Border.NO_BORDER)
                    .setPaddingBottom(1));

            document.add(pacoteTable);

            if (!orcamento.getPacote().getServicos().isEmpty()) {

                Table servicosTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                        .useAllAvailableWidth()
                        .setMarginBottom(5);

                for (PacoteServico ps : orcamento.getPacote().getServicos()) {

                    servicosTable.addCell(new Cell()
                            .add(new Paragraph("• " + ps.getServico().getNome())
                                    .setFont(fontRegular)
                                    .setFontSize(10))
                            .setPaddingLeft(15)
                            .setPaddingTop(2)
                            .setPaddingBottom(2)
                            .setBorder(Border.NO_BORDER));
                }

                document.add(servicosTable);
            }
        }

        if (!orcamento.getServicos().isEmpty()) {

            if (nonNull(orcamento.getPacote())) {
                document.add(new Paragraph("Serviços Adicionais")
                        .setFont(fontBold)
                        .setFontSize(11)
                        .setMarginTop(10)
                        .setMarginBottom(5));
            }

            Table adicionaisTable = new Table(UnitValue.createPercentArray(new float[]{4, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(5);

            for (var sa : orcamento.getServicos()) {

                adicionaisTable.addCell(new Cell()
                        .add(new Paragraph("• " + sa.getServico().getNome())
                                .setFont(fontRegular)
                                .setFontSize(10))
                        .setBorder(Border.NO_BORDER)
                        .setPaddingTop(3)
                        .setPaddingBottom(3));

                adicionaisTable.addCell(new Cell()
                        .add(new Paragraph(formatarValor(sa.getValor()))
                                .setFont(fontRegular)
                                .setFontSize(10))
                        .setTextAlignment(TextAlignment.RIGHT)
                        .setBorder(Border.NO_BORDER)
                        .setPaddingTop(3)
                        .setPaddingBottom(3));
            }

            document.add(adicionaisTable);
        }
    }

    private void adicionarValores(Document document, Orcamento orcamento,
                                   PdfFont fontBold, PdfFont fontRegular) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth()
                .setHorizontalAlignment(HorizontalAlignment.RIGHT)
                .setWidth(UnitValue.createPercentValue(50))
                .setMarginTop(20)
                .setMarginBottom(15);

        if (orcamento.getValorDesconto() != null && orcamento.getValorDesconto().compareTo(BigDecimal.ZERO) > 0) {
            table.addCell(new Cell()
                    .add(new Paragraph("Subtotal:").setFont(fontRegular).setFontSize(11))
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell()
                    .add(new Paragraph(formatarValor(orcamento.getValor())).setFont(fontRegular).setFontSize(11))
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT));

            table.addCell(new Cell()
                    .add(new Paragraph("Desconto:").setFont(fontRegular).setFontSize(11))
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell()
                    .add(new Paragraph("-" + formatarValor(orcamento.getValorDesconto())).setFont(fontRegular).setFontSize(11))
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontColor(new DeviceRgb(0, 128, 0)));
        }

        // Total
        table.addCell(new Cell()
                .add(new Paragraph("TOTAL:").setFont(fontBold).setFontSize(12))
                .setBorder(Border.NO_BORDER)
                .setBorderTop(new com.itextpdf.layout.borders.SolidBorder(ColorConstants.BLACK, 1))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPaddingTop(5));
        table.addCell(new Cell()
                .add(new Paragraph(formatarValor(orcamento.getValorFinal())).setFont(fontBold).setFontSize(12))
                .setBorder(Border.NO_BORDER)
                .setBorderTop(new com.itextpdf.layout.borders.SolidBorder(ColorConstants.BLACK, 1))
                .setTextAlignment(TextAlignment.RIGHT)
                .setPaddingTop(5));

        document.add(table);
    }

    private void adicionarObservacoes(Document document, Orcamento orcamento,
                                       PdfFont fontBold, PdfFont fontRegular) {
        document.add(new Paragraph("OBSERVAÇÕES")
                .setFont(fontBold)
                .setFontSize(12)
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(5)
                .setMarginBottom(5));

        document.add(new Paragraph(orcamento.getObservacao())
                .setFont(fontRegular)
                .setFontSize(10)
                .setMarginBottom(15));
    }

    private Cell createValueCell(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text)
                        .setFont(font)
                        .setFontSize(10))
                .setBorder(Border.NO_BORDER)
                .setPaddingBottom(3);
    }

    private String formatarValor(BigDecimal valor) {
        if (valor == null) return "R$ 0,00";
        return String.format("R$ %,.2f", valor);
    }

}
