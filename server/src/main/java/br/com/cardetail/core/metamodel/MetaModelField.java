package br.com.cardetail.core.metamodel;

import br.com.cardetail.core.enumsupport.EnumValue;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Optional;

@ToString(of = {"fieldName", "fieldPath"})
@Getter
@Setter
public class MetaModelField extends MetaModel {

    private String fieldName;

    private String fieldPath;

    private String fieldFullPath;

    private Optional<Boolean> primaryKey;

    private Optional<Boolean> required;

    private Integer lenght;

    private Long min;

    private Long max;

    private Optional<MetaModelRelation> relation = Optional.empty();

    private String caption;

    private List<EnumValue<? extends Enum<?>, ?>> enumOptions;

    private boolean calculatedModel;

    private boolean removeDot;

    private boolean changeable = true;

    @JsonIgnore
    private MetaModel parent;

    public void setRelation(MetaModelRelation relation) {
        this.relation = Optional.ofNullable(relation);
    }

    public void setPrimaryKey(Boolean primaryKey) {
        this.primaryKey = Optional.ofNullable(primaryKey);
    }

    public void setRequired(Boolean required) {
        this.required = Optional.ofNullable(required);
    }

    public MetaModelRelation getParentRelation(MetaModelRelation defaultValue) {

        return Optional.ofNullable(parent)
                .filter(p -> p instanceof MetaModelField)
                .map(MetaModelField.class::cast)
                .flatMap(MetaModelField::getRelation)
                .orElse(defaultValue);
    }

}
