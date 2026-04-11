import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import CorVeiculoFormFields from './CorVeiculoFormFields';
import { CorVeiculoDTO, createCorVeiculo } from './CorVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const INITIAL_VALUES: Partial<CorVeiculoDTO> = {
    nome: '',
};

export default function CorVeiculoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<CorVeiculoDTO>>(INITIAL_VALUES);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof CorVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome da cor é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await createCorVeiculo(values as CorVeiculoDTO);

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
            message: 'Cor criada com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/cores');
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
                { title: 'Cores de Veículos', path: '/app/cadastros/cores' },
                { title: 'Nova' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/cadastros/cores"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <CorVeiculoFormFields
                    cor={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
