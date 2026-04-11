package br.com.cardetail.validator;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.ServicoTerceirizado;
import br.com.cardetail.domain.ServicoTerceirizadoTipoVeiculo;
import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.repository.ServicoTerceirizadoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ServicoTerceirizadoValidator {

    private final ServicoTerceirizadoRepository repository;

    public void validate(final ServicoTerceirizado servico) {
        verifyExistsNomeByTipoVeiculo(servico);
    }

    private void verifyExistsNomeByTipoVeiculo(final ServicoTerceirizado servico) {
        final Set<UUID> idsTipos = servico.getTiposVeiculos()
                .stream()
                .map(ServicoTerceirizadoTipoVeiculo::getTipo)
                .map(TipoVeiculo::getId)
                .collect(Collectors.toSet());

        final List<TipoVeiculo> repetidos = repository.getTiposVeiculosRepetidos(servico.getId(), servico.getNome(), idsTipos);

        if (!repetidos.isEmpty()) {
            final String tipos = repetidos.stream()
                    .map(TipoVeiculo::getDescricao)
                    .collect(Collectors.joining(", "));

            throw new IllegalArgumentException(String.format("O serviço terceirizado %s já está cadastrado para %s.", servico.getNome(), tipos));
        }
    }

}
