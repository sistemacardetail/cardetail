package br.com.cardetail.resource;

import java.time.Duration;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Value;

import br.com.cardetail.config.jwt.JwtTokenProvider;
import br.com.cardetail.domain.Usuario;
import br.com.cardetail.domain.security.Permissao;
import br.com.cardetail.dto.LoginRequestDTO;
import br.com.cardetail.dto.seguranca.LoginResponseDTO;
import br.com.cardetail.repository.UsuarioRepository;
import br.com.cardetail.service.AuditoriaService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthResource {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthResource(AuthenticationManager authenticationManager,
                        JwtTokenProvider tokenProvider,
                        UsuarioRepository usuarioRepository,
                        AuditoriaService auditoriaService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    private static final int TENTATIVAS_BLOQUEIO = 5;
    private static final int MINUTOS_BLOQUEIO = 15;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO request, HttpServletResponse httpResponse) {
        try {
            // Verificar rate limiting
            if (!auditoriaService.verificarRateLimitLogin()) {
                log.warn("Rate limit excedido para IP");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Collections.singletonMap("errorMessage", "Muitas tentativas de login. Aguarde um momento."));
            }

            // Buscar usuário pelo login
            Usuario usuario = usuarioRepository.findByLogin(request.username())
                    .orElse(null);

            if (usuario == null) {
                auditoriaService.registrarLoginFalho(request.username());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("errorMessage", "Usuário ou senha inválidos."));
            }

            // Verificar se usuário está bloqueado
            if (usuario.isBloqueado()) {
                auditoriaService.registrarLoginFalho(request.username());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("errorMessage",
                            "Usuário bloqueado temporariamente. Tente novamente em alguns minutos."));
            }

            // Verificar se usuário está ativo
            if (!usuario.isAtivo()) {
                auditoriaService.registrarLoginFalho(request.username());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("errorMessage", "Usuário inativo."));
            }

            try {
                final Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.username(), request.password())
                );

                final String token = tokenProvider.generateToken(authentication);

                ResponseCookie cookie = ResponseCookie.from("token", token)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .sameSite("Lax")
                        .maxAge(Duration.ofDays(1))
                        .build();

                httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                // Registrar login bem-sucedido
                usuario.registrarLogin();
                usuarioRepository.save(usuario);
                auditoriaService.registrarLogin(usuario.getId(), usuario.getNome());

                log.info("Login bem-sucedido para o usuário: {}", request.username());

                // Obter permissões do usuário
                Set<String> permissoes = usuario.getPerfil().getPermissoes()
                        .stream()
                        .map(Permissao::getCodigo)
                        .collect(Collectors.toSet());

                LoginResponseDTO response = new LoginResponseDTO(
                    usuario.getId(),
                    usuario.getLogin(),
                    usuario.getNome(),
                    usuario.getPerfilNome(),
                    permissoes
                );

                return ResponseEntity.ok(response);

            } catch (AuthenticationException e) {
                // Incrementar tentativas de login
                usuario.increaseAttemptsLogin();

                if (usuario.getAttemptsLogin() >= TENTATIVAS_BLOQUEIO) {
                    usuario.blockByMinutes(MINUTOS_BLOQUEIO);
                    log.warn("Usuário {} bloqueado por {} minutos após {} tentativas",
                            request.username(), MINUTOS_BLOQUEIO, TENTATIVAS_BLOQUEIO);
                }

                usuarioRepository.save(usuario);
                auditoriaService.registrarLoginFalho(request.username());

                log.warn("Falha na autenticação para o usuário: {}", request.username());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("errorMessage", "Usuário ou senha inválidos."));
            }

        } catch (Exception e) {
            log.error("Erro interno na autenticação", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("errorMessage", "Ocorreu um erro ao validar o login."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse httpResponse) {
        try {
            auditoriaService.registrarLogout();
        } catch (Exception e) {
            // Ignora erros de auditoria no logout
        }

        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Logout bem-sucedido.");

        return ResponseEntity.ok().body(Collections.singletonMap("message", "Logout bem-sucedido."));
    }

    @GetMapping("/validar-token")
    public ResponseEntity<?> validarToken() {
        return ResponseEntity.ok().body(Collections.singletonMap("message", "Token válido."));
    }
}
