package br.com.cardetail.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.cardetail.core.repository.BaseRepository;
import br.com.cardetail.domain.ServicoTerceirizado;
import br.com.cardetail.domain.TipoVeiculo;

@Repository
public interface ServicoTerceirizadoRepository extends BaseRepository<ServicoTerceirizado, UUID> {

    @Query("""
        SELECT DISTINCT t
        FROM ServicoTerceirizado st
        JOIN st.tiposVeiculos tv
        JOIN tv.tipo t
        WHERE st.nome ILIKE :nome
        AND t.id IN (:idsTiposVeiculos)
        AND (:idServico IS NULL OR st.id <> :idServico)
    """)
    List<TipoVeiculo> getTiposVeiculosRepetidos(@Param("idServico") UUID idServico,
            @Param("nome") String nome,
            @Param("idsTiposVeiculos") Set<UUID> idsTiposVeiculos);

}
