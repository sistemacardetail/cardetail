package br.com.cardetail.core.metamodel;

import br.com.cardetail.core.utils.ListUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.NumberUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

@Getter
public class MetaModel {

    private static final String ILLEGAL_COLUMNS_SIZE = "A quantidade de colunas informadas (%d) excede o máximo permitido (%d). Favor reduza o número de colunas selecionadas para que o relatório fique legível.";

    private String dataType;

    @Setter
    private Class<?> clazz;

    private final Map<String, MetaModelField> fields = new HashMap<>();

    public void setDataType(Class<?> dataType) {
        this.dataType = dataType.getSimpleName();
        this.clazz = dataType;
    }

    @Override
    public String toString() {

        return "MetaModel [className=" + dataType + ", fields=" + fields + "]";
    }

    public MetaModel byPath(String field) {
        Preconditions.checkArgument(!Strings.isNullOrEmpty(field), "Invalid field path");

        return byPath(Lists.newArrayList(StringUtils.split(field, ".")));
    }

    public MetaModel byPath(List<String> fields) {

        Preconditions.checkArgument(!ListUtils.safeIsEmpty(fields), "fields cannot be empty");

        String field = fields.removeFirst();

        if (getFields().containsKey(field)) {
            MetaModelField root = getFields().get(field);

            if (fields.isEmpty()) {

                return root;
            }

            return root.byPath(fields);
        }

        throw new IllegalArgumentException("path " + field + " not found");
    }

    public String getCaption(String fieldPath) {
        String[] fields = StringUtils.split(fieldPath, ".");

        Optional<String> byFieldName = getCaptionByFieldName(fields);

        if (byFieldName.isPresent()) {
            return byFieldName.get();
        }

        final String result = getCaptionByFieldPath(fields);

        if (isNull(result)) {
            throw new IllegalArgumentException("Field not found for path: " + fieldPath);
        }

        return result;
    }

    private Optional<String> getCaptionByFieldName(String[] fields) {
        StringBuilder sb = new StringBuilder();

        MetaModel metaModel = this;
        for (int i = 0; i < fields.length; i++) {
            String field = fields[i];

            MetaModelField modelField = metaModel.fields.get(removerChaves(field));

            if (isNull(modelField)) {

                return Optional.empty();
            }

            String caption = modelField.getCaption();

            if (!sb.isEmpty() && !caption.isEmpty()) {

                sb.append(" - ");
            }

            sb.append(caption.trim());
            metaModel = modelField;
        }

        return Optional.of(sb.toString());
    }

    private String getCaptionByFieldPath(String[] fields) {
        StringBuilder sb = new StringBuilder();

        MetaModel metaModel = this;
        for (int i = 0; i < fields.length; i++) {
            String field = fields[i];

            MetaModelField modelField = null;

            while (isNull(modelField)) {

                modelField = metaModel.findFieldByPath(removerChaves(field));

                if (isNull(modelField) && i + 1 < fields.length) {

                    field = String.join(".", field, fields[++i]);
                } else {

                    break;
                }
            }

            if (isNull(modelField)) {

                return null;
            }

            String caption = modelField.getCaption();

            if (!sb.isEmpty() && !caption.isEmpty()) {

                sb.append(" - ");
            }

            sb.append(caption.trim());
            metaModel = modelField;
        }

        return sb.toString();
    }

    /**
     * Busca o MetaModelField pelo campo {@link MetaModelField#getFieldPath()}.
     *
     */
    public MetaModelField findFieldByPath(String fieldPath) {
        if (fields.isEmpty() || isNull(fields.values())) {
            return null;
        }

        Optional<MetaModelField> firstField = fields.values().stream()
                .filter(f -> f.getFieldPath().equalsIgnoreCase(fieldPath)).findFirst();

        if (firstField.isPresent()) {

            return firstField.get();
        }

        return null;
    }

    private String removerChaves(String field) {
        int indexOfBracket = field.indexOf('[');
        if (indexOfBracket > -1) {
            return field.substring(0, indexOfBracket);
        }
        return field;
    }

    @JsonIgnore
    public Optional<MetaModelField> getId() {

        return getFields().values().stream()
                .filter(f -> nonNull(f.getPrimaryKey()) && f.getPrimaryKey().isPresent() && f.getPrimaryKey().get())
                .findFirst();
    }

    /**
     * Gera um stream de {@link MetaModelField} contendo os campos que foram
     * especificados no parâmetro "fields".
     *
     * @param fields - Os campos que estão na classe do meta model, separados
     *            por vírgula. Ex: id,descricao,ativo.
     *
     * @return {@link Stream} com os metaModelField que foram encontrados.
     */
    public Stream<MetaModelField> getFields(String fields, Integer limit) {

        final List<String> fieldList = Splitter.on(",").omitEmptyStrings().trimResults().splitToList(fields);

        return this.getFields(fieldList, limit);
    }

    /**
     * Gera um stream de {@link MetaModelField} contendo os campos que foram
     * especificados no parâmetro "fields".
     * Caso a quantidade campos do parâmetro fieldList seja maior do que o
     * limite, um {@link IllegalArgumentException} será lançado.
     *
     * @param fieldList - Lista de string contendo os campos para gerar os
     *            metamodelFields
     *
     * @return {@link Stream} com os metaModelField que foram encontrados
     */
    public Stream<MetaModelField> getFields(List<String> fieldList, Integer limit) {

        if (isNull(fieldList)) {
            return Stream.empty();
        }

        if (fieldList.size() > limit) {
            throw new IllegalArgumentException(String.format(ILLEGAL_COLUMNS_SIZE, fieldList.size(), limit));
        }

        return fieldList.stream().map(this::byPath).filter(Objects::nonNull).filter(m -> m instanceof MetaModelField)
                .map(m -> (MetaModelField) m);
    }

    public boolean isNumber() {
        return NumberUtils.STANDARD_NUMBER_TYPES.contains(clazz);
    }

}
