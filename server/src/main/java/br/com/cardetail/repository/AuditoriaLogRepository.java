package br.com.cardetail.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.cardetail.domain.security.AuditoriaLog;
import br.com.cardetail.domain.security.AuditoriaLog.Acao;

public interface AuditoriaLogRepository extends JpaRepository<AuditoriaLog, UUID> {

    List<AuditoriaLog> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);

    List<AuditoriaLog> findByEntidadeAndEntidadeIdOrderByCreatedAtDesc(String entidade, UUID entidadeId);

    Page<AuditoriaLog> findByAcaoOrderByCreatedAtDesc(Acao acao, Pageable pageable);

    @Query("SELECT a FROM AuditoriaLog a WHERE " +
           "a.createdAt BETWEEN :inicio AND :fim " +
           "ORDER BY a.createdAt DESC")
    Page<AuditoriaLog> findByPeriodo(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim,
        Pageable pageable
    );

    @Query("SELECT a FROM AuditoriaLog a WHERE " +
           "(:usuarioId IS NULL OR a.usuarioId = :usuarioId) AND " +
           "(:acao IS NULL OR a.acao = :acao) AND " +
           "(:entidade IS NULL OR a.entidade = :entidade) AND " +
           "a.createdAt BETWEEN :inicio AND :fim " +
           "ORDER BY a.createdAt DESC")
    Page<AuditoriaLog> buscarComFiltros(
        @Param("usuarioId") UUID usuarioId,
        @Param("acao") Acao acao,
        @Param("entidade") String entidade,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim,
        Pageable pageable
    );

    @Query("SELECT COUNT(a) FROM AuditoriaLog a WHERE " +
           "a.acao = :acao AND " +
           "a.ipAddress = :ip AND " +
           "a.createdAt > :desde")
    long countByAcaoAndIpDesde(
        @Param("acao") Acao acao,
        @Param("ip") String ip,
        @Param("desde") LocalDateTime desde
    );
}
