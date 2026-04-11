package br.com.cardetail.validator;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Servico;
import br.com.cardetail.domain.ServicoTipoVeiculo;
import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.repository.PacoteRepository;
import br.com.cardetail.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ServicoValidator {

    private final ServicoRepository repository;
    private final PacoteRepository pacoteRepository;

    public void validate(final Servico servico) {
        verifyExistsNome(servico);
        verifyPacoteOrAgendamento(servico);

        if (!servico.isAtivo()) {
            verifyExistsPacoteAtivo(servico);
        }

        if (!servico.isDisponivelPacote()) {
            verifyExistsPacote(servico);
        }
    }

    private void verifyPacoteOrAgendamento(final Servico servico) {
        if (!servico.isDisponivelPacote() && !servico.isDisponivelAgendamento()) {
            throw new IllegalArgumentException("O serviço deve ser disponível para pacote ou agendamento.");
        }
    }

    private void verifyExistsNome(final Servico servico) {
        final Set<UUID> idsTipos = servico.getTiposVeiculos()
                .stream()
                .map(ServicoTipoVeiculo::getTipo)
                .map(TipoVeiculo::getId)
                .collect(Collectors.toSet());

        final List<TipoVeiculo> repetidos = repository.getTiposServicosRepetidos(servico.getId(), servico.getNome(), idsTipos);

        if (!repetidos.isEmpty()) {
            final String tipos = repetidos.stream()
                    .map(TipoVeiculo::getDescricao)
                    .collect(Collectors.joining(", "));

            throw new IllegalArgumentException(String.format("O serviço %s já está cadastrado para %s.", servico.getNome(), tipos));
        }
    }

    private void verifyExistsPacote(final Servico servico) {
        if (pacoteRepository.existsByServicosServicoId(servico.getId())) {
            throw new IllegalArgumentException("O serviço está vinculado em pacote e não pode ser desmarcado a opção 'Disponível para Pacote'.");
        }
    }

    private void verifyExistsPacoteAtivo(final Servico servico) {
        if (pacoteRepository.existsByServicosServicoIdAndAtivoIsTrue(servico.getId())) {
            throw new IllegalArgumentException("O serviço não pode ser inativado pois está vinculado em pacote ativo.");
        }
    }

}
