import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import OrcamentoFormFields from './OrcamentoFormFields';
import { createOrcamento, splitOrcamentoServicosForApi } from './OrcamentoService';
import { useOrcamentoForm } from './useOrcamentoForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

export default function OrcamentoCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const notifications = useNotifications();

    const fromPath = (location.state as { from?: string })?.from || '/app/orcamentos';

    const {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handleVeiculoChange,
        handlePacoteChange,
        handleAddServico,
        handleRemoveServico,
        handleServicoChange,
        handleServicoValorChange,
        reset,
        validate,
        valorTotal,
        valorFinal,
        tempoEstimadoTotal,
    } = useOrcamentoForm();

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'error',
            });
            return;
        }

        const orcamentoData = splitOrcamentoServicosForApi(values);

        const result = await createOrcamento(orcamentoData);

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
            message: `Orçamento criado com sucesso!`,
            severity: 'success',
        });
        navigate(fromPath);
    }, [values, navigate, notifications, validate, setErrors, fromPath]);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Orçamentos', path: '/app/orcamentos' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={reset}
                backButtonPath={fromPath}
                permission={PERMISSOES.ORCAMENTOS_CRIAR}
                isDirty={isDirty}
            >
                <OrcamentoFormFields
                    values={values}
                    onChange={handleChange}
                    onVeiculoChange={handleVeiculoChange}
                    onPacoteChange={handlePacoteChange}
                    onAddServico={handleAddServico}
                    onRemoveServico={handleRemoveServico}
                    onServicoChange={handleServicoChange}
                    onServicoValorChange={handleServicoValorChange}
                    valorTotal={valorTotal}
                    valorFinal={valorFinal}
                    tempoEstimadoTotal={tempoEstimadoTotal}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
