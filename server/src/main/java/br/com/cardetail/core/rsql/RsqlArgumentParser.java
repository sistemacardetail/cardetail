package br.com.cardetail.core.rsql;

import br.com.cardetail.core.enumsupport.EnumConverter;
import br.com.cardetail.core.external.misc.DefaultArgumentParser;
import br.com.cardetail.core.utils.EnumUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

public class RsqlArgumentParser extends DefaultArgumentParser {

    protected static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    protected static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    protected static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ISO_TIME;

    @Override
    public <T> T parse(String argument, Class<T> type) {

        if (Objects.isNull(argument) || "null".equals(argument.trim().toLowerCase(Locale.getDefault()))) {
            return null;
        }

        if (Long.class.equals(type) && new BigInteger(argument).compareTo(BigInteger.valueOf(Long.MAX_VALUE)) > 0) {
            throw new IllegalArgumentException("Limite de caracteres do tipo numérico atingido.");
        }

        if (type.equals(BigDecimal.class)) {
            return (T) new BigDecimal(argument);
        } else if (type.equals(LocalDate.class)) {
            return (T) LocalDate.parse(argument, DATE_FORMATTER);
        } else if (type.equals(LocalDateTime.class)) {
            return (T) LocalDateTime.parse(argument, DATE_TIME_FORMATTER);
        } else if (type.equals(LocalTime.class)) {
            return (T) LocalTime.parse(argument, TIME_FORMATTER);
        } else if (type.equals(UUID.class)) {
            return (T) UUID.fromString(argument);
        } else if (EnumConverter.class.isAssignableFrom(type)) {
            Class<?> typeOfEnum = EnumUtils.getTypeOf((Class<EnumConverter>) type);

            Object value = super.parse(argument, typeOfEnum);

            return (T) EnumUtils.getEnumFromValue((Class) type, value);
        }

        return super.parse(argument, type);
    }

}
