package br.com.cardetail.config.security;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import br.com.cardetail.domain.Usuario;
import br.com.cardetail.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityContext {

    private static final String USER_CACHE_KEY = "CACHED_USUARIO_LOGADO";

    private final UsuarioRepository usuarioRepository;

    @SuppressWarnings("unchecked")
    public Optional<Usuario> getUsuarioLogado() {
        HttpServletRequest request = getCurrentRequest();

        if (request != null) {
            Object cached = request.getAttribute(USER_CACHE_KEY);
            if (cached != null) {
                return (Optional<Usuario>) cached;
            }
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String login = authentication.getName();
        Optional<Usuario> usuario = usuarioRepository.findByLogin(login);

        if (request != null) {
            request.setAttribute(USER_CACHE_KEY, usuario);
        }

        return usuario;
    }

    public UUID getUsuarioIdLogado() {
        return getUsuarioLogado()
            .map(Usuario::getId)
            .orElse(null);
    }

    public String getNomeLogado() {
        return getUsuarioLogado()
            .map(Usuario::getNome)
            .orElse(null);
    }

    public boolean hasPermissao(String codigo) {
        return getUsuarioLogado()
            .map(u -> u.hasPermissao(codigo))
            .orElse(false);
    }

    public boolean isAdministrador() {
        return getUsuarioLogado()
            .map(Usuario::isAdmin)
            .orElse(false);
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
