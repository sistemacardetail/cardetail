package br.com.cardetail.core.exception;

import lombok.Getter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

@Getter
public class RestException extends RuntimeException {

    private static final String RECORD_NOT_FOUND_MESSAGE = "Registro não encontrado";
    private static final String RECORD_CONFLICT = "Registro com conflito";
    private static final String NOT_ALLOWED = "Método não permitido";

    private final HttpStatus httpStatus;
    private final HttpHeaders headers;

    public RestException(HttpStatus status, String message) {
        this(status, message, new HttpHeaders());
    }

    public RestException(HttpStatus status, String message, HttpHeaders headers) {
        super(message);
        this.httpStatus = status;
        this.headers = headers;
    }

    public RestException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.httpStatus = status;
        this.headers = new HttpHeaders();
    }

    public static RestException notFound() {
        return notFound(RECORD_NOT_FOUND_MESSAGE);
    }

    public static RestException notFound(String message) {
        return status(HttpStatus.NOT_FOUND, message);
    }

    public static RestException notFound(String message, Throwable cause) {
        return status(HttpStatus.NOT_FOUND, message, cause);
    }

    public static RestException conflict() {
        return status(HttpStatus.CONFLICT, RECORD_CONFLICT);
    }

    public static RestException status(HttpStatus status, String message) {
        return new RestException(status, message);
    }

    public static RestException status(HttpStatus status, String message, Throwable cause) {
        return new RestException(status, message, cause);
    }

    public static RestException notAllowed() {
        return status(HttpStatus.METHOD_NOT_ALLOWED, NOT_ALLOWED);
    }

}
