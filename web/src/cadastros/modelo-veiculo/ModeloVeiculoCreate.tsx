import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import ModeloVeiculoFormFields from './ModeloVeiculoFormFields';
import { createModeloVeiculo, ModeloVeiculoDTO } from './ModeloVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const INITIAL_VALUES: Partial<ModeloVeiculoDTO> = {
    nome: '',
    marca: undefined,
    tipo: undefined,
};

export default function ModeloVeiculoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<ModeloVeiculoDTO>>(INITIAL_VALUES);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof ModeloVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome do modelo é obrigatório',
                severity: 'error',
            });
            return;
        }

        if (!values.marca) {
            notifications.show({
                message: 'A marca é obrigatória',
                severity: 'error',
            });
            return;
        }

        if (!values.tipo) {
            notifications.show({
                message: 'O tipo de veículo é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await createModeloVeiculo(values as ModeloVeiculoDTO);

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
            message: 'Modelo criado com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/modelos');
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
                { title: 'Modelos de Veículos', path: '/app/cadastros/modelos' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/cadastros/modelos"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <ModeloVeiculoFormFields
                    modelo={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
