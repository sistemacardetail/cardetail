import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import ServicoFormFields from './ServicoFormFields';
import { createServico, ServicoDTO } from './ServicoService';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';

const INITIAL_VALUES: Partial<ServicoDTO> = {
    nome: '',
    observacao: '',
    valor: 0,
    tempoExecucaoMin: 0,
    ativo: true,
    disponivelPacote: true,
    tiposVeiculos: [],
};

export default function ServicoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<ServicoDTO>>(INITIAL_VALUES);
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

        const result = await createServico(values as ServicoDTO);

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
            message: 'Serviço criado com sucesso!',
            severity: 'success',
        });
        navigate('/app/servicos');
    }, [values, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, []);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Serviços', path: '/app/servicos' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/servicos"
                permission={PERMISSOES.SERVICOS_CRIAR}
                isDirty={isDirty}
            >
                <ServicoFormFields
                    servico={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
