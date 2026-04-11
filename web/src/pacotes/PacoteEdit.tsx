import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import PacoteFormFields from './PacoteFormFields';
import { getPacoteById, PacoteDTO, updatePacote } from './PacoteService';
import { usePacoteForm } from './usePacoteForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

interface PacoteEditFormProps {
    initialValues: PacoteDTO;
}

function PacoteEditForm({ initialValues }: PacoteEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handleAddServico,
        handleRemoveServico,
        handleServicoChange,
        reset,
        validate,
    } = usePacoteForm(initialValues);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'error',
            });
            return;
        }

        const result = await updatePacote(id!, values as PacoteDTO);

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
            message: 'Pacote atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/pacotes');
    }, [values, id, navigate, notifications, validate, setErrors]);

    return (
        <CrudForm
            onSubmit={handleSubmit}
            onReset={reset}
            backButtonPath="/app/pacotes"
            permission={PERMISSOES.PACOTES_EDITAR}
            isDirty={isDirty}
        >
            <PacoteFormFields
                values={values}
                onChange={handleChange}
                onAddServico={handleAddServico}
                onRemoveServico={handleRemoveServico}
                onServicoChange={handleServicoChange}
                errors={errors}
            />
        </CrudForm>
    );
}

export default function PacoteEdit() {
    return (
        <CrudEdit<PacoteDTO>
            title=""
            breadcrumbs={[
                { title: 'Pacotes', path: '/app/pacotes' },
                { title: 'Editar' },
            ]}
            loadFn={getPacoteById}
        >
            {(data) => (
                <PacoteEditForm initialValues={data} />
            )}
        </CrudEdit>
    );
}
