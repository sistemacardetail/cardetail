import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import { createTipoVeiculo, TipoVeiculoDTO } from './TipoVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import TipoVeiculoFormFields from './TipoVeiculoFormFields';
import { PERMISSOES } from '../../contexts/AuthContext';

const INITIAL_VALUES: Partial<TipoVeiculoDTO> = {
    descricao: '',
};

export default function TipoVeiculoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<TipoVeiculoDTO>>(INITIAL_VALUES);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof TipoVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!values.descricao?.trim()) {
            notifications.show({
                message: 'A descrição do tipo é obrigatória',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await createTipoVeiculo(values as TipoVeiculoDTO);

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
            message: 'Tipo de Veículo criado com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/tipos-veiculos');
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
                { title: 'Tipos de Veículos', path: '/app/cadastros/tipos-veiculos' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/cadastros/tipos-veiculos"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <TipoVeiculoFormFields
                    tipo={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
