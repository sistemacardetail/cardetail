import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import ClienteFormFields from './ClienteFormFields';
import { useClienteForm } from './useClienteForm';
import { ClienteDTO, createCliente, createClienteWithResponse } from './ClienteService';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

export default function ClienteCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const notifications = useNotifications();

    // Detecta de onde veio (dashboard ou lista)
    const locationState = location.state as { from?: string; returnWithVeiculo?: boolean } | null;
    const fromPath = locationState?.from || '/app/clientes';
    const returnWithVeiculo = locationState?.returnWithVeiculo || false;

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
    } = useClienteForm();

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            const firstError = Object.values(errors)[0];
            if (firstError) {
                notifications.show({ message: firstError, severity: 'error' });
            }
            return;
        }

        if (returnWithVeiculo) {
            const result = await createClienteWithResponse(values as ClienteDTO);

            if (result.error) {
                const errorMessage = formatApiErrors(result.errors) || result.error;
                notifications.show({ message: errorMessage, severity: 'error' });

                const fieldErrors = extractFieldErrors(result.errors);
                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(fieldErrors);
                }
                return;
            }

            notifications.show({ message: 'Cliente criado com sucesso!', severity: 'success' });

            if (result.data?.veiculos?.length) {
                const primeiroVeiculo = result.data.veiculos[0];
                const separator = fromPath.includes('?') ? '&' : '?';
                navigate(`${fromPath}${separator}veiculoId=${primeiroVeiculo.id}`);
            } else {
                navigate(fromPath);
            }
            return;
        }

        const result = await createCliente(values as ClienteDTO);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({ message: errorMessage, severity: 'error' });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({ message: 'Cliente criado com sucesso!', severity: 'success' });
        navigate(fromPath);
    }, [values, errors, validate, navigate, notifications, setErrors, fromPath, returnWithVeiculo]);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Clientes', path: '/app/clientes' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm onSubmit={handleSubmit}
                      onReset={reset}
                      backButtonPath={fromPath}
                      permission={PERMISSOES.CLIENTES_CRIAR}
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
        </PageContainer>
    );
}
