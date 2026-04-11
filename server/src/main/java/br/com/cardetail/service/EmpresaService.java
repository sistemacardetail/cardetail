package br.com.cardetail.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import br.com.cardetail.domain.Cidade;
import br.com.cardetail.domain.Empresa;
import br.com.cardetail.domain.Endereco;
import br.com.cardetail.domain.Telefone;
import br.com.cardetail.dto.configuracao.EmpresaCreateDTO;
import br.com.cardetail.dto.configuracao.EmpresaDTO;
import br.com.cardetail.repository.EmpresaRepository;
import br.com.cardetail.validator.CnpjValidator;
import lombok.RequiredArgsConstructor;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository repository;
    private final CnpjValidator cnpjValidator;
    private final CidadeService cidadeService;
    private final AuditoriaService auditoriaService;

    private static final long MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
    private static final String[] ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};

    public EmpresaDTO buscar() {
        return repository.findFirst()
            .map(this::toDTO)
            .orElse(null);
    }

    public String buscarNomeFantasia() {
        return repository.findFirst()
            .map(Empresa::getNomeFantasia)
            .orElse(null);
    }

    public EmpresaDTO buscarPorId(UUID id) {
        return repository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada"));
    }

    @Transactional
    public EmpresaDTO salvar(EmpresaCreateDTO dto) {
        String cnpjLimpo = cnpjValidator.limpar(dto.cnpj());

        if (!cnpjValidator.isValido(cnpjLimpo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
        }

        Empresa empresa = repository.findFirst().orElse(new Empresa());
        boolean isNovo = empresa.getId() == null;

        empresa.setNomeFantasia(dto.nomeFantasia());
        empresa.setRazaoSocial(dto.razaoSocial());
        empresa.setCnpj(cnpjLimpo);

        if (isNull(empresa.getEndereco())) {
            empresa.setEndereco(new Endereco());
        }

        empresa.getEndereco().setCep(dto.cep());
        empresa.getEndereco().setLogradouro(dto.logradouro());
        empresa.getEndereco().setNumero(dto.numero());
        empresa.getEndereco().setComplemento(dto.complemento());
        empresa.getEndereco().setBairro(dto.bairro());

        if (nonNull(dto.idCidade())) {
            empresa.getEndereco().setCidade(cidadeService.findOne(dto.idCidade()));
        }

        if (nonNull(dto.telefone())) {
            if (isNull(empresa.getTelefone())) {
                empresa.setTelefone(new Telefone());
            }
            empresa.getTelefone().setNumero(dto.telefone().getNumero());
            empresa.getTelefone().setDdd(dto.telefone().getDdd());
        }

        empresa = repository.save(empresa);

        if (isNovo) {
            auditoriaService.registrarCriacao("Empresa", empresa.getId());
        } else {
            auditoriaService.registrarAtualizacao("Empresa", empresa.getId());
        }

        return toDTO(empresa);
    }

    @Transactional
    public void uploadLogo(UUID id, MultipartFile arquivo) {
        Empresa empresa = repository.findFirst().orElse(new Empresa());

        validarArquivoLogo(arquivo);

        try {
            byte[] dados = arquivo.getBytes();

            empresa.setLogoBy(dados, arquivo.getContentType());

            repository.save(empresa);

            auditoriaService.registrarAtualizacao("Empresa", empresa.getId());

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro ao salvar o logo: " + e.getMessage());
        }
    }

    @Transactional
    public void removerLogo(UUID id) {
        Empresa empresa = repository.findFirst().orElse(new Empresa());

        if (empresa.hasLogo()) {
            empresa.setLogo(null);

            auditoriaService.registrarAtualizacao("Empresa", empresa.getId());

            repository.save(empresa);
        }
    }

    public byte[] getLogo(UUID id) {
        Empresa empresa = repository.findFirst().orElse(new Empresa());

        if (!empresa.hasLogo()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Logo não encontrado");
        }

        return empresa.getLogo().getImagem();
    }

    public String getLogoContentType(UUID id) {
        Empresa empresa = repository.findFirst().orElse(new Empresa());

        return empresa.getLogo().getContentType();
    }

    private void validarCnpjUnico(String cnpj, UUID idIgnorar) {
        boolean existe = idIgnorar == null
            ? repository.existsByCnpj(cnpj)
            : repository.existsByCnpjAndIdNot(cnpj, idIgnorar);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ já cadastrado");
        }
    }

    private void validarArquivoLogo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo não enviado");
        }

        if (arquivo.getSize() > MAX_LOGO_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "O arquivo deve ter no máximo 2MB");
        }

        String contentType = arquivo.getContentType();
        boolean tipoPermitido = false;
        for (String tipo : ALLOWED_CONTENT_TYPES) {
            if (tipo.equals(contentType)) {
                tipoPermitido = true;
                break;
            }
        }

        if (!tipoPermitido) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tipo de arquivo não permitido. Use: JPEG, PNG, GIF ou WebP");
        }
    }

    private EmpresaDTO toDTO(Empresa empresa) {
        final Endereco endereco = empresa.getEndereco();
        final Cidade cidade = nonNull(endereco) ? endereco.getCidade() : null;

        return new EmpresaDTO(
            empresa.getId(),
            empresa.getNomeFantasia(),
            empresa.getRazaoSocial(),
            empresa.getCnpj(),
            empresa.getCnpjFormatado(),
            nonNull(endereco) ? endereco.getCep() : EMPTY,
            nonNull(endereco) ? endereco.getLogradouro() : EMPTY,
            nonNull(endereco) ? endereco.getNumero() : EMPTY,
            nonNull(endereco) ? endereco.getComplemento() : EMPTY,
            nonNull(endereco) ? endereco.getBairro() : EMPTY,
            nonNull(cidade) ? cidade.getId() : null,
            nonNull(cidade) ? cidade.getNome() : EMPTY,
            nonNull(cidade) ? cidade.getUf().getSigla() : EMPTY,
            empresa.getEnderecoCompleto(),
            nonNull(empresa.getTelefone()) ? empresa.getTelefone().getNumeroFormatado() : EMPTY,
            empresa.hasLogo()
        );
    }
}
