package br.com.cardetail.core.enumsupport;

import br.com.cardetail.core.metamodel.MetaModel;
import br.com.cardetail.core.metamodel.MetaModelField;
import br.com.cardetail.core.metamodel.MetaModelLoader;
import br.com.cardetail.core.metamodel.annotation.Caption;
import br.com.cardetail.core.metamodel.annotation.ToModel;
import com.google.common.base.Preconditions;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import org.hibernate.validator.constraints.Length;

@ToString
@EqualsAndHashCode
@ToModel(exclude = {"value"})
@Getter
public class EnumValue<E extends Enum<E>, T> {

    private static final String FIELD_CODIGO = "codigo";

    @Caption("Código")
    private final T codigo;

    @Caption("Descrição")
    @Length(max = 100)
    private final String descricao;

    private final E value;

    public EnumValue(T codigo, String descricao, E value) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.value = value;
    }

    public static <T> MetaModel createMetaModelLong() {
        return createMetaModel(Long.class);
    }

    public static <T> MetaModel createMetaModelString(int fieldSize) {
        Preconditions.checkArgument(fieldSize > 0, "FieldSize deve ser maior que zero.");

        MetaModel metaModel = createMetaModel(String.class);
        metaModel.getFields().get(FIELD_CODIGO).setLenght(fieldSize);
        return metaModel;
    }

    private static <T> MetaModel createMetaModel(Class<T> codigoType) {
        MetaModel metaModel = MetaModelLoader.newMetaModel(EnumValue.class);
        MetaModelField fieldCodigo = metaModel.getFields().get(FIELD_CODIGO);
        fieldCodigo.setDataType(codigoType);
        fieldCodigo.setPrimaryKey(Boolean.TRUE);

        return metaModel;
    }
}
