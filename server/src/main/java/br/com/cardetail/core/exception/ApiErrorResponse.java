package br.com.cardetail.core.exception;

import java.time.ZonedDateTime;
import java.util.List;

public record ApiErrorResponse(
        String error,
        int status,
        ZonedDateTime timestamp,
        List<FieldErrorDTO> errors
) {}