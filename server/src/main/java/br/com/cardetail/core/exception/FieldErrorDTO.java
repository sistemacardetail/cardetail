package br.com.cardetail.core.exception;

public record FieldErrorDTO(String field, String message, Object rejectedValue) {}
