import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import PacoteFormFields from './PacoteFormFields';
import { createPacote, getPacoteById, PacoteDTO } from './PacoteService';
import { usePacoteForm } from './usePacoteForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

export default function PacoteCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const notifications = useNotifications();
    const [initialValues, setInitialValues] = React.useState<Partial<PacoteDTO> | undefined>();

    const duplicarId = searchParams.get('duplicar');

    React.useEffect(() => {
        const loadPacoteParaDuplicar = async () => {
            if (!duplicarId) return;

            try {
                const result = await getPacoteById(duplicarId);
                if (result.data) {
                    const pacoteDuplicado: Partial<PacoteDTO> = {
                        ...result.data,
                        id: undefined,
                        nome: `${result.data.nome}`,
                        valor: 0,
                        tipoVeiculo: undefined,
                        servicos: result.data.servicos?.map(s => ({
                            ...s,
                            id: undefined,
                        })) || [],
                    };
                    setInitialValues(pacoteDuplicado);
                }
            } catch {
                notifications.show({
                    message: 'Erro ao duplicar',
                    severity: 'error',
                });
            }
        };

        loadPacoteParaDuplicar();
    }, [duplicarId, notifications]);

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

        const result = await createPacote(values as PacoteDTO);

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
            message: 'Pacote criado com sucesso!',
            severity: 'success',
        });
        navigate('/app/pacotes');
    }, [values, navigate, notifications, validate, setErrors]);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Pacotes', path: '/app/pacotes' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={reset}
                backButtonPath="/app/pacotes"
                permission={PERMISSOES.PACOTES_CRIAR}
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
        </PageContainer>
    );
}
