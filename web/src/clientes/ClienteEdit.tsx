import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import ClienteFormFields from './ClienteFormFields';
import { useClienteForm } from './useClienteForm';
import { ClienteDTO, getClienteById, updateCliente } from './ClienteService';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

interface ClienteEditFormProps {
    initialValues: ClienteDTO;
}

function ClienteEditForm({ initialValues }: ClienteEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handleTelefoneChange,
        handleAddTelefone,
        handleRemoveTelefone,
        handleVeiculoChange,
        handleAddVeiculo,
        handleRemoveVeiculo,
        reset,
        validate,
    } = useClienteForm(initialValues);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            const firstError = Object.values(errors)[0];
            if (firstError) {
                notifications.show({ message: firstError, severity: 'error' });
            }
            return;
        }

        const result = await updateCliente(id!, values as ClienteDTO);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({ message: errorMessage, severity: 'error' });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({ message: 'Cliente atualizado com sucesso!', severity: 'success' });
        navigate('/app/clientes');
    }, [values, errors, id, validate, navigate, notifications, setErrors]);

    return (
        <CrudForm onSubmit={handleSubmit}
                  onReset={reset}
                  backButtonPath="/app/clientes"
                  permission={PERMISSOES.CLIENTES_EDITAR}
                  isDirty={isDirty}
        >
            <ClienteFormFields
                values={values}
                errors={errors}
                onFieldChange={handleChange}
                onTelefoneChange={handleTelefoneChange}
                onAddTelefone={handleAddTelefone}
                onRemoveTelefone={handleRemoveTelefone}
                onVeiculoChange={handleVeiculoChange}
                onAddVeiculo={handleAddVeiculo}
                onRemoveVeiculo={handleRemoveVeiculo}
            />
        </CrudForm>
    );
}

export default function ClienteEdit() {
    return (
        <CrudEdit<ClienteDTO>
            title=""
            breadcrumbs={[
                { title: 'Clientes', path: '/app/clientes' },
                { title: 'Editar' },
            ]}
            loadFn={getClienteById}
        >
            {(data) => (
                <ClienteEditForm initialValues={data} />
            )}
        </CrudEdit>
    );
}
