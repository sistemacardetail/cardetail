package br.com.cardetail.validator;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Pacote;
import br.com.cardetail.domain.PacoteServico;
import br.com.cardetail.domain.Servico;
import br.com.cardetail.repository.PacoteRepository;
import br.com.cardetail.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class PacoteValidator {

    private final PacoteRepository repository;
    private final ServicoRepository servicoRepository;

    public void validate(final Pacote pacote) {
        verifyExistsNome(pacote);
        if (pacote.isAtivo()) {
            verifyStatusServicos(pacote.getServicos()
                    .stream()
                    .map(PacoteServico::getServico)
                    .collect(Collectors.toSet())
            );
        }
    }

    private void verifyStatusServicos(final Set<Servico> servicos) {
        final List<String> nomesInativos = servicoRepository.getNomesInativosByIds(servicos.stream()
                .map(Servico::getId)
                .collect(Collectors.toSet()));

        if (!nomesInativos.isEmpty()) {
            throw new IllegalArgumentException(String.format("Existe serviço inativo no pacote [%s].", String.join(", ", nomesInativos)));
        }
    }

    private void verifyExistsNome(final Pacote pacote) {
        if (repository.isNomeRepetido(pacote.getId(), pacote.getNome(), pacote.getTipoVeiculo().getId())) {
            throw new IllegalArgumentException(String.format("O pacote %s já está cadastrado para %s.",
                    pacote.getNome(), pacote.getTipoVeiculo().getDescricao()));
        }
    }

}
