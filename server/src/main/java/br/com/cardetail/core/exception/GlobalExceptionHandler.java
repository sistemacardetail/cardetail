package br.com.cardetail.core.exception;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import cz.jirutka.rsql.parser.ParseException;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {

        List<FieldErrorDTO> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new FieldErrorDTO(
                        err.getField(),
                        Optional.ofNullable(err.getDefaultMessage()).orElse("Erro não identificado!"),
                        Optional.ofNullable(err.getRejectedValue()).orElse("null")
                ))
                .toList();

        List<FieldErrorDTO> globalErrors = ex.getBindingResult().getGlobalErrors().stream()
                .map(err -> {
                    String message = Optional.ofNullable(err.getDefaultMessage()).orElse("Erro global");
                    return new FieldErrorDTO("global", message, null);
                })
                .toList();

        List<FieldErrorDTO> allErrors = new ArrayList<>();
        allErrors.addAll(fieldErrors);
        allErrors.addAll(globalErrors);

        ApiErrorResponse response = new ApiErrorResponse(
                "Dados inválidos",
                HttpStatus.BAD_REQUEST.value(),
                ZonedDateTime.now(),
                allErrors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "Dados incorretos",
                HttpStatus.BAD_REQUEST.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, ex.getMessage(), null))
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        List<FieldErrorDTO> fieldErrors = ex.getConstraintViolations().stream()
                .map(violation -> new FieldErrorDTO(
                        violation.getPropertyPath().toString(),
                        violation.getMessage(),
                        Optional.ofNullable(violation.getInvalidValue()).orElse("null")
                ))
                .toList();

        ApiErrorResponse response = new ApiErrorResponse(
                "Erro de validação de dados",
                HttpStatus.BAD_REQUEST.value(),
                ZonedDateTime.now(),
                fieldErrors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        ApiErrorResponse response = new ApiErrorResponse(
                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
                status.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(), null))
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(ParseException.class)
    public ResponseEntity<ApiErrorResponse> handleParseException(ParseException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "Não foi possível realizar a consulta.",
                HttpStatus.BAD_REQUEST.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, ex.getMessage(), null))
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(RestException.class)
    public ResponseEntity<ApiErrorResponse> handleRestException(RestException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                ex.getMessage(),
                ex.getHttpStatus().value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, ex.getMessage(), null))
        );

        return ResponseEntity.status(ex.getHttpStatus()).headers(ex.getHeaders()).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "O usuário não possui permissão.";

        ApiErrorResponse response = new ApiErrorResponse(
                "Acesso negado",
                HttpStatus.FORBIDDEN.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, message, null))
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(AuthenticationException ex) {

        ApiErrorResponse response = new ApiErrorResponse(
                "Não autenticado",
                HttpStatus.UNAUTHORIZED.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, "Necessário realizar o login.", null))
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace();

        ApiErrorResponse response = new ApiErrorResponse(
                "Erro interno do servidor",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ZonedDateTime.now(),
                List.of(new FieldErrorDTO(null, "Ocorreu um erro inesperado.", null))
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
