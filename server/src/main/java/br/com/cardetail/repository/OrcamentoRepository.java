package br.com.cardetail.repository;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.Orcamento;

@Repository
public interface OrcamentoRepository extends BaseRepository<Orcamento, UUID> {

    boolean existsByVeiculoIdIn(Set<UUID> idsVeiculos);

    boolean existsByVeiculoId(UUID idVeiculo);

    boolean existsByPacoteId(UUID idPacote);

    boolean existsByServicosServicoId(UUID idServico);

    boolean existsByServicosTerceirizadosServicoId(UUID idServico);

}
