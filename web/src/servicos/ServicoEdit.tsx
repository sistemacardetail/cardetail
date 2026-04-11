import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import ServicoFormFields from './ServicoFormFields';
import { getServicoById, ServicoDTO, updateServico } from './ServicoService';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

interface ServicoEditFormProps {
    initialValues: ServicoDTO;
}

function ServicoEditForm({ initialValues }: ServicoEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const [values, setValues] = React.useState<Partial<ServicoDTO>>(initialValues);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof ServicoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        // Validação básica
        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome do serviço é obrigatório',
                severity: 'error',
            });
            return;
        }

        if (!values.tiposVeiculos?.length) {
            notifications.show({
                message: 'Selecione pelo menos um tipo de veículo',
                severity: 'error',
            });
            return;
        }

        if (!values.disponivelPacote && !values.disponivelAgendamento) {
            notifications.show({
                message: 'Selecione pelo menos uma opção de disponibilidade',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await updateServico(id!, values as ServicoDTO);

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
            message: 'Serviço atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/servicos');
    }, [values, id, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsDirty(false);
    }, [initialValues]);

    return (
        <CrudForm
            onSubmit={handleSubmit}
            onReset={handleReset}
            backButtonPath="/app/servicos"
            permission={PERMISSOES.SERVICOS_EDITAR}
            isDirty={isDirty}
        >
            <ServicoFormFields
                servico={values}
                onChange={handleChange}
                errors={errors}
            />
        </CrudForm>
    );
}

export default function ServicoEdit() {
    return (
        <CrudEdit<ServicoDTO>
            title=""
            breadcrumbs={[
                { title: 'Serviços', path: '/app/servicos' },
                { title: 'Editar' },
            ]}
            loadFn={getServicoById}
        >
            {(data) => (
                <ServicoEditForm initialValues={data} />
            )}
        </CrudEdit>
    );
}
