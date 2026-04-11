import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import PerfilFormFields, { PerfilFormValues } from './PerfilFormFields';
import { PerfilService } from '../usuarios';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const initialValues: PerfilFormValues = {
    nome: '',
    descricao: '',
    nivel: 3,
    ativo: true,
    permissoesIds: [],
};

export default function PerfilCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<PerfilFormValues>(initialValues);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleFieldChange = React.useCallback((field: keyof PerfilFormValues, value: string | number | boolean | number[]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const validate = React.useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!values.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (values.nivel < 1 || values.nivel > 10) {
            newErrors.nivel = 'Nível deve ser entre 1 e 10';
        }

        if (values.permissoesIds.length === 0) {
            newErrors.permissoes = 'Selecione pelo menos uma permissão';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            return;
        }

        const result = await PerfilService.criar({
            nome: values.nome,
            descricao: values.descricao,
            nivel: values.nivel,
            ativo: values.ativo,
            permissoesIds: values.permissoesIds,
        });

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({ message: errorMessage, severity: 'error' });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({ message: 'Perfil criado com sucesso!', severity: 'success' });
        navigate('/app/configuracoes/perfis');
    }, [values, validate, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsDirty(false);
    }, []);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Configurações', path: '/app/configuracoes' },
                { title: 'Perfis', path: '/app/configuracoes/perfis' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm onSubmit={handleSubmit}
                      onReset={handleReset}
                      backButtonPath="/app/configuracoes/perfis"
                      permission={PERMISSOES.PERFIS_CRIAR}
                      isDirty={isDirty}
            >
                <PerfilFormFields
                    values={values}
                    errors={errors}
                    onFieldChange={handleFieldChange}
                />
            </CrudForm>
        </PageContainer>
    );
}
