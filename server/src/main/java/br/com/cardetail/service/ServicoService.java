package br.com.cardetail.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.Servico;
import br.com.cardetail.repository.PacoteRepository;
import br.com.cardetail.repository.ServicoRepository;
import br.com.cardetail.validator.ServicoExcludeValidator;
import br.com.cardetail.validator.ServicoValidator;
import lombok.RequiredArgsConstructor;

import static java.util.Objects.nonNull;

@RequiredArgsConstructor
@Service
public class ServicoService extends BaseService<Servico, UUID> {

    private final ServicoValidator validator;
    private final ServicoExcludeValidator excludeValidator;
    private final ServicoRepository repository;
    private final PacoteRepository pacoteRepository;

    @Override
    protected void beforeDelete(Servico entity) {
        excludeValidator.validate(entity);
    }

    @Override
    protected void beforeSave(Servico entity) {
        validator.validate(entity);
    }

    public List<Servico> getServicosPacote(final UUID idTipoVeiculo) {
        return repository.getServicosPacote(idTipoVeiculo);
    }

    public List<Servico> getServicosAgendamento(final UUID idTipoVeiculo, final UUID idPacote) {
        final Set<UUID> idsExclude = getIdsServicosExcludeByPacote(idPacote);
        return repository.getServicosAgendamento(idTipoVeiculo, idsExclude, idsExclude.isEmpty());
    }

    private Set<UUID> getIdsServicosExcludeByPacote(final UUID idPacote) {
        final Set<UUID> idsExclude = new HashSet<>();
        if (nonNull(idPacote)) {
            idsExclude.addAll(pacoteRepository.getIdsServicosPacote(idPacote));
        }

        return idsExclude;
    }
}
