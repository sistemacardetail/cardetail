import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import MarcaVeiculoFormFields from './MarcaVeiculoFormFields';
import { createMarcaVeiculo, MarcaVeiculoDTO } from './MarcaVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const INITIAL_VALUES: Partial<MarcaVeiculoDTO> = {
    nome: '',
};

export default function MarcaVeiculoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<MarcaVeiculoDTO>>(INITIAL_VALUES);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof MarcaVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome da marca é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await createMarcaVeiculo(values as MarcaVeiculoDTO);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({
                message: errorMessage,
                severity: 'error',
            });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({
            message: 'Marca criada com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/marcas');
    }, [values, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, []);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Cadastros', path: '/app/cadastros' },
                { title: 'Marcas de Veículos', path: '/app/cadastros/marcas' },
                { title: 'Nova' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/cadastros/marcas"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <MarcaVeiculoFormFields
                    marca={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
