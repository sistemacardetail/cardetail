package br.com.cardetail.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.config.security.SecurityContext;
import br.com.cardetail.domain.security.AuditoriaLog;
import br.com.cardetail.domain.security.AuditoriaLog.Acao;
import br.com.cardetail.repository.AuditoriaLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaLogRepository repository;
    private final SecurityContext securityContext;
    private final HttpServletRequest request;

    private static final int MAX_TENTATIVAS_LOGIN_POR_MINUTO = 5;

    @Transactional
    public void registrarLogin(UUID usuarioId, String nome) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.LOGIN, "Usuario")
            .comUsuario(usuarioId, nome)
            .comEntidadeId(usuarioId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarLogout() {
        UUID usuarioId = securityContext.getUsuarioIdLogado();
        String nome = securityContext.getNomeLogado();

        AuditoriaLog log = AuditoriaLog.criar(Acao.LOGOUT, "Usuario")
            .comUsuario(usuarioId, nome)
            .comEntidadeId(usuarioId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarLoginFalho(String nome) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.LOGIN_FAILED, "Usuario")
            .comUsuario(null, nome)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarCriacao(String entidade, UUID entidadeId) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.CREATE, entidade)
            .comUsuario(securityContext.getUsuarioIdLogado(), securityContext.getNomeLogado())
            .comEntidadeId(entidadeId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarAtualizacao(String entidade, UUID entidadeId) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.UPDATE, entidade)
            .comUsuario(securityContext.getUsuarioIdLogado(), securityContext.getNomeLogado())
            .comEntidadeId(entidadeId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarExclusao(String entidade, UUID entidadeId) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.DELETE, entidade)
            .comUsuario(securityContext.getUsuarioIdLogado(), securityContext.getNomeLogado())
            .comEntidadeId(entidadeId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    @Transactional
    public void registrarAlteracaoSenha(UUID usuarioId) {
        AuditoriaLog log = AuditoriaLog.criar(Acao.PASSWORD_CHANGE, "Usuario")
            .comUsuario(securityContext.getUsuarioIdLogado(), securityContext.getNomeLogado())
            .comEntidadeId(usuarioId)
            .comRequestInfo(getClientIp(), getUserAgent());

        repository.save(log);
    }

    public Page<AuditoriaLog> buscar(UUID usuarioId, Acao acao, String entidade,
                                      LocalDateTime inicio, LocalDateTime fim, Pageable pageable) {
        return repository.buscarComFiltros(usuarioId, acao, entidade, inicio, fim, pageable);
    }

    public boolean verificarRateLimitLogin() {
        String ip = getClientIp();
        LocalDateTime umMinutoAtras = LocalDateTime.now().minusMinutes(1);

        long tentativas = repository.countByAcaoAndIpDesde(Acao.LOGIN_FAILED, ip, umMinutoAtras);

        return tentativas < MAX_TENTATIVAS_LOGIN_POR_MINUTO;
    }

    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getUserAgent() {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null && userAgent.length() > 500) {
            return userAgent.substring(0, 500);
        }
        return userAgent;
    }
}
