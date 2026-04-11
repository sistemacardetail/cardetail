package br.com.cardetail.core.metamodel;

import br.com.cardetail.core.enumsupport.EnumConverter;
import br.com.cardetail.core.enumsupport.EnumValue;
import br.com.cardetail.core.metamodel.annotation.CalculatedModel;
import br.com.cardetail.core.metamodel.annotation.Caption;
import br.com.cardetail.core.metamodel.annotation.MetaModelFieldPath;
import br.com.cardetail.core.metamodel.annotation.MetaModelIgnore;
import br.com.cardetail.core.metamodel.annotation.ToModel;
import br.com.cardetail.core.utils.EnumUtils;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Preconditions;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.ClassUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Length;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.beans.Introspector;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static java.util.Objects.nonNull;

@NoArgsConstructor
public final class MetaModelLoader {

    private static final String GET_PREFIX = "get";

    private static final Logger LOG = LoggerFactory.getLogger(MetaModelLoader.class);

    private static final List<CascadeType> LIST_CASCADE_CHANGES = Arrays.asList(CascadeType.MERGE, CascadeType.REMOVE,
            CascadeType.ALL);

    private final List<String> visitedNodes = new ArrayList<>();

    public static MetaModel newMetaModel(Class<?> clazz) {
        return newMetaModel(clazz, true);

    }

    public static MetaModel newMetaModel(Class<?> clazz, boolean deeply) {
        Preconditions.checkArgument(nonNull(clazz));

        return new MetaModelLoader().createMetaModel(clazz, deeply, Collections.emptyList());
    }

    public static MetaModel newMetaModel(Class<?> clazz, List<String> fields) {
        return new MetaModelLoader().createMetaModel(clazz, true, fields);
    }

    private MetaModel createMetaModel(Class<?> clazz, boolean deeply, List<String> fields) {
        MetaModel model = new MetaModel();
        model.setDataType(clazz);

        Class<?> current = clazz;
        while (!current.equals(Object.class)) {
            loadModelValues(current, model, deeply, false, null, fields);
            current = current.getSuperclass();
        }

        return model;
    }

    private void loadModelValues(Class<?> clazz, MetaModel metaModel, boolean deeply, boolean ignoreConstraints,
                                 ToModel toModelAnnotation, List<String> fields) {
        loadValues(clazz, metaModel, deeply, ignoreConstraints, "", toModelAnnotation, fields);
    }

    private void loadValues(Class<?> clazz, MetaModel metaModel, boolean deeply, boolean ignoreConstraints,
                            String rootFieldPath, ToModel toModelAnnotation, List<String> fields) {

        LOG.debug("Loading fields from {} of class {}", rootFieldPath, clazz.getName());

        List<String> of = new ArrayList<>();
        List<String> exclude = new ArrayList<>();

        validateToModel(clazz, toModelAnnotation, of, exclude);

        for (Field classField : clazz.getDeclaredFields()) {

            if (Modifier.isStatic(classField.getModifiers()) || Modifier.isTransient(classField.getModifiers())) {
                continue;
            }

            if (exclude.contains(classField.getName().toLowerCase(Locale.getDefault()))
                    || classField.isAnnotationPresent(MetaModelIgnore.class)) {
                continue;
            }

            if (!accept(fields, classField.getName(), rootFieldPath)) {

                continue;
            }

            if (of.isEmpty() || of.contains(classField.getName().toLowerCase(Locale.getDefault()))) {

                loadFieldValues(metaModel, classField, deeply, ignoreConstraints, rootFieldPath, fields);

            }

        }

        loadCalculatedModel(clazz, metaModel, deeply, of, exclude, fields, rootFieldPath);

    }

    private boolean accept(List<String> fields, String fieldName, String rootFieldPath) {

        if (fields.isEmpty()) {

            return true;
        }

        final StringBuilder fieldPath = new StringBuilder();

        if (!StringUtils.isEmpty(rootFieldPath)) {

            fieldPath.append(rootFieldPath).append('.');
        }

        fieldPath.append(fieldName);

        boolean found = fields.stream().anyMatch(f -> f.startsWith(fieldPath.toString()));

        LOG.debug("eval {} found {}", fieldPath, found);

        return found;
    }

    private void validateToModel(Class<?> clazz, ToModel toModelAnnotation, List<String> of, List<String> exclude) {
        if (clazz.isAnnotationPresent(ToModel.class) || nonNull(toModelAnnotation)) {

            ToModel toModel = Optional.ofNullable(toModelAnnotation).orElse(clazz.getAnnotation(ToModel.class));

            of.addAll(Arrays.asList(toModel.of()));
            exclude.addAll(Arrays.asList(toModel.exclude()));

            toLowerCase(of);
            toLowerCase(exclude);
        }
    }

    private void toLowerCase(List<String> listString) {

        listString.replaceAll(s -> s.toLowerCase(Locale.getDefault()));

    }

    private void loadCalculatedModel(Class<?> clazz, MetaModel metaModel, boolean deeply, List<String> of,
                                     List<String> exclude, List<String> fields, String rootField) {

        for (Method method : clazz.getMethods()) {
            if (method.isAnnotationPresent(CalculatedModel.class)) {

                CalculatedModel calculatedModel = method.getAnnotation(CalculatedModel.class);

                String fieldName = method.getName().replace(GET_PREFIX, "");

                fieldName = Introspector.decapitalize(fieldName);

                if (exclude.contains(fieldName)) {
                    continue;
                }

                if (!accept(fields, fieldName, rootField)) {

                    continue;
                }

                if (of.isEmpty() || of.contains(fieldName)) {
                    MetaModelField field = new MetaModelField();
                    metaModel.getFields().put(fieldName, field);
                    field.setFieldName(fieldName);

                    field.setCaption(
                            Optional.of(calculatedModel.caption()).filter(c ->
                                    !c.isEmpty()).orElse(fieldName));

                    field.setCalculatedModel(true);
                    field.setDataType(method.getReturnType());
                    field.setRemoveDot(calculatedModel.removeDot());

                    String rootPath = getRootField(metaModel);

                    field.setFieldPath(
                            rootPath + StringUtils.defaultIfEmpty(calculatedModel.fieldPath(), field.getFieldName()));
                    field.setFieldFullPath(rootPath + field.getFieldName());

                    attrCalculatedCaption(method, field);

                    readCalculatedFields(deeply, method, field, fields);

                }
            }
        }
    }

    private String getRootField(MetaModel metaModel) {
        String rootPath = "";
        if (metaModel instanceof MetaModelField) {

            rootPath = String.format("%s.", ((MetaModelField) metaModel).getFieldPath());
        }
        return rootPath;
    }

    private void attrCalculatedCaption(Method method, MetaModelField field) {
        if (method.isAnnotationPresent(Caption.class)) {
            Caption caption = method.getAnnotation(Caption.class);
            field.setCaption(caption.value());
        }
    }

    private void readCalculatedFields(boolean deeply, Method method, MetaModelField field, List<String> fields) {

        if (!ClassUtils.isPrimitiveOrWrapper(method.getReturnType())) {
            field.setRelation(MetaModelRelation.EMBEDDED);

            loadValues(method.getReturnType(), field, deeply, true, field.getFieldPath(), null, fields);

        }
    }

    private void loadFieldValues(MetaModel metaModel, Field classField, boolean deeply, Boolean ignoreConstraints,
                                 String rootFieldPath, List<String> fields) {

        ToModel toModelAnnotation = null;

        if (classField.isAnnotationPresent(ToModel.class)) {

            toModelAnnotation = classField.getAnnotation(ToModel.class);
        }

        MetaModelField field = createMetaModelField(classField, ignoreConstraints,
                rootFieldPath, metaModel);

        if (isEmbedded(classField)) {
            field.setRelation(MetaModelRelation.EMBEDDED);
            loadValues(classField.getType(), field, deeply,
                    ignoreConstraints, field.getFieldFullPath(),
                    toModelAnnotation, fields);
        } else if (deeply && classField.isAnnotationPresent(ManyToOne.class)) {

            ManyToOne manyToOne = classField.getAnnotation(ManyToOne.class);

            addAssociation(classField, deeply, ignoreConstraints, toModelAnnotation, field,
                    MetaModelRelation.MANY_TO_ONE,
                    manyToOne.cascade(), fields);

        } else if (deeply && classField.isAnnotationPresent(OneToOne.class)) {

            OneToOne oneToOne = classField.getAnnotation(OneToOne.class);

            addAssociation(classField, deeply, ignoreConstraints, toModelAnnotation, field,
                    MetaModelRelation.ONE_TO_ONE,
                    oneToOne.cascade(), fields);

        } else if (deeply && classField.isAnnotationPresent(OneToMany.class)) {

            OneToMany oneToMany = classField.getAnnotation(OneToMany.class);

            field.setChangeable(calculeChangeble(oneToMany.cascade()));

            field.setRelation(MetaModelRelation.ONE_TO_MANY);
            ParameterizedType type = (ParameterizedType) classField.getGenericType();

            Class<?> itemType = (Class<?>) type.getActualTypeArguments()[0];

            field.setDataType(itemType);

            Class<?> current = itemType;
            while (!current.equals(Object.class)) {
                loadValues(current, field, deeply, ignoreConstraints, field.getFieldFullPath(), toModelAnnotation,
                        fields);
                current = current.getSuperclass();
            }
        }

        MetaModelField existentField = metaModel.getFields().put(field.getFieldName(), field);

        if (nonNull(existentField)) {

            Preconditions.checkArgument(true,
                    "Duplicate erro: field " + field + " already added " + existentField);

        }

    }

    private void addAssociation(Field classField, boolean deeply, Boolean ignoreConstraints, ToModel toModelAnnotation,
                                MetaModelField field, MetaModelRelation metaModelRelation, CascadeType[] cascadeType, List<String> fields) {

        String node = String.format("%s.%s->%s->%s",
                classField.getDeclaringClass().getSimpleName(),
                classField.getName(),
                field.getParentRelation(metaModelRelation),
                classField.getType().getSimpleName());

        LOG.debug("Processamento relacionamento {}", node);

        if (visitedNodes.contains(node)) {
            return;
        }

        visitedNodes.add(node);

        field.setChangeable(calculeChangeble(cascadeType));

        field.setRelation(metaModelRelation);

        Class<?> current = classField.getType();
        while (!current.equals(Object.class)) {
            loadValues(current, field, deeply, ignoreConstraints, field.getFieldFullPath(),
                    toModelAnnotation, fields);
            current = current.getSuperclass();
        }
    }

    private boolean calculeChangeble(CascadeType[] cascade) {

        return Arrays.stream(cascade)
                .anyMatch(LIST_CASCADE_CHANGES::contains);
    }

    private boolean isEmbedded(Field classField) {
        return classField.isAnnotationPresent(Embedded.class) || classField.isAnnotationPresent(EmbeddedId.class);
    }

    private MetaModelField createMetaModelField(Field classField, boolean ignoreConstraints,
                                                String rootFieldPath, MetaModel parent) {

        MetaModelField field = new MetaModelField();
        field.setFieldName(getFieldName(classField));
        field.setDataType(getDataType(classField));
        field.setParent(parent);
        if (classField.getType().isEnum()) {
            field.setClazz(classField.getType());
            createEnumOptions(field);
        }

        field.setCaption(field.getFieldName());

        field.setFieldPath(getFieldPath(classField));

        field.setFieldFullPath(joinFieldPath(rootFieldPath, classField.getName()));

        if (classField.isAnnotationPresent(Caption.class)) {
            field.setCaption(classField.getAnnotation(Caption.class).value());
        }

        setFieldLimits(classField, field);

        if (!ignoreConstraints) {
            if (classField.isAnnotationPresent(Id.class)) {
                field.setPrimaryKey(Boolean.TRUE);
            }

            if (classField.isAnnotationPresent(NotEmpty.class) || classField.isAnnotationPresent(NotNull.class)
                    || classField.isAnnotationPresent(NotBlank.class)) {
                field.setRequired(Boolean.TRUE);
            } else if (classField.isAnnotationPresent(Column.class)) {
                Column column = classField.getAnnotation(Column.class);
                field.setRequired(!column.nullable());
            }

        }

        return field;
    }

    private <E> void createEnumOptions(MetaModelField field) {

        if (EnumConverter.class.isAssignableFrom(field.getClazz())) {

            Class enumClass = field.getClazz();

            List<EnumValue<? extends Enum<?>, ?>> values = EnumUtils.getEnumValuesMap(enumClass).getListValues();

            field.setEnumOptions(values);
        }
    }

    private String getFieldPath(Field classField) {
        String fieldPath = classField.getName();
        if (classField.isAnnotationPresent(MetaModelFieldPath.class)) {
            MetaModelFieldPath fieldPathAnnotation = classField.getAnnotation(MetaModelFieldPath.class);
            fieldPath = fieldPathAnnotation.value();
        }
        return fieldPath;
    }

    private String getFieldName(Field classField) {
        if (classField.isAnnotationPresent(JsonProperty.class)) {
            JsonProperty jsonProperty = classField.getAnnotation(JsonProperty.class);
            return StringUtils.defaultIfBlank(jsonProperty.value(), classField.getName());
        }

        return classField.getName();
    }

    private String joinFieldPath(String rootFieldPath, String name) {
        if (StringUtils.isNotBlank(rootFieldPath)) {
            return rootFieldPath + "." + name;
        }
        return name;
    }

    private Class<?> getDataType(Field classField) {
        if (classField.getType().isEnum()) {

            if (classField.isAnnotationPresent(Enumerated.class)) {
                if (classField.getAnnotation(Enumerated.class).value() == EnumType.STRING) {
                    return String.class;
                } else {
                    return Long.class;
                }

            }

            if (EnumConverter.class.isAssignableFrom(classField.getType())) {

                return EnumUtils.getTypeOf((Class<? extends EnumConverter>) classField.getType());

            }

            return String.class;

        }
        return classField.getType();

    }

    private void setFieldLimits(Field classField, MetaModelField field) {
        if (classField.isAnnotationPresent(Column.class) && "String".equals(field.getDataType())) {
            Column column = classField.getAnnotation(Column.class);
            field.setLenght(column.length());
        }

        if (classField.isAnnotationPresent(Length.class)) {
            Length lenght = classField.getAnnotation(Length.class);

            field.setMin((long) lenght.min());
            field.setMax((long) lenght.max());
            field.setLenght(lenght.max());
        }

        if (classField.isAnnotationPresent(Min.class)) {
            field.setMin(classField.getAnnotation(Min.class).value());
        }

        if (classField.isAnnotationPresent(Max.class)) {
            field.setMax(classField.getAnnotation(Max.class).value());
        }
    }

}
