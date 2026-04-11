import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../../components/crud';
import PerfilFormFields, { PerfilFormValues } from './PerfilFormFields';
import { PerfilCreateDTO, PerfilDTO, PerfilService } from '../usuarios';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const PERFIS_PADRAO = ['ADMINISTRADOR', 'FUNCIONARIO'];

const INITIAL_VALUES: Partial<PerfilDTO> & { permissoesIds?: number[] } = {
    nome: '',
    descricao: '',
    nivel: 3,
    ativo: true,
    permissoes: [],
    permissoesIds: [],
};

interface PerfilEditFormProps {
    initialValues: PerfilDTO;
}

function PerfilEditForm({ initialValues }: PerfilEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const [values, setValues] = React.useState<Partial<PerfilDTO> & { permissoesIds?: number[] }>(
        initialValues ? { ...initialValues, permissoesIds: initialValues.permissoes?.map(p => p.id) || [] } : INITIAL_VALUES
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        if (initialValues) {
            setValues({
                ...initialValues,
                permissoesIds: initialValues.permissoes?.map(p => p.id) || [],
            });
        }
    }, [initialValues]);

    const [isPerfilPadrao] = React.useState(PERFIS_PADRAO.includes(initialValues.nome));

    const handleFieldChange = React.useCallback((field: keyof PerfilFormValues, value: string | number | boolean | number[]) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const validate = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
        if (values?.nivel && (values.nivel < 1 || values.nivel > 10)) newErrors.nivel = 'Nível deve ser entre 1 e 10';
        if (!values.permissoesIds || values.permissoesIds.length === 0) {
            newErrors.permissoes = 'Selecione pelo menos uma permissão';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    const reset = React.useCallback(() => {
        setValues(initialValues ? { ...initialValues, permissoesIds: initialValues.permissoes?.map(p => p.id) || [] } : INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, [initialValues]);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            const firstError = Object.values(errors)[0];
            if (firstError) {
                notifications.show({ message: firstError, severity: 'error' });
            }
            return;
        }

        const payload: PerfilCreateDTO = {
            nome: values.nome!,
            descricao: values.descricao || '',
            nivel: values.nivel!,
            ativo: values.ativo ?? true,
            permissoesIds: values.permissoesIds || [],
        };

        const result = await PerfilService.atualizar(id!, payload);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({ message: errorMessage, severity: 'error' });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({ message: 'Perfil atualizado com sucesso!', severity: 'success' });
        navigate('/app/configuracoes/perfis');
    }, [values, errors, id, validate, navigate, notifications, setErrors]);

    return (
        <CrudForm
            onSubmit={handleSubmit}
            onReset={reset}
            backButtonPath="/app/configuracoes/perfis"
            permission={PERMISSOES.PERFIS_EDITAR}
            isDirty={isDirty}
        >
            <PerfilFormFields
                values={values}
                errors={errors}
                onFieldChange={handleFieldChange}
                isPerfilPadrao={isPerfilPadrao}
            />
        </CrudForm>
    );
}

export default function PerfilEdit() {
    return (
        <CrudEdit<PerfilDTO>
            title=""
            breadcrumbs={[
                { title: 'Perfis', path: '/app/perfis' },
                { title: 'Editar' },
            ]}
            loadFn={PerfilService.buscarPorId}
        >
            {(data) => (
                <PerfilEditForm initialValues={data} />
            )}
        </CrudEdit>
    );
}
