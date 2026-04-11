import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';
import { createServicoTerceirizado, ServicoTerceirizadoDTO } from './ServicoTerceirizadoService';
import ServicoTerceirizadoFormFields from './ServicoTerceirizadoFormFields';

const INITIAL_VALUES: Partial<ServicoTerceirizadoDTO> = {
    nome: '',
    observacao: '',
    ativo: true,
    tiposVeiculos: [],
};

export default function ServicoCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<Partial<ServicoTerceirizadoDTO>>(INITIAL_VALUES);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleChange = React.useCallback((field: keyof ServicoTerceirizadoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
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

        const nomeFornecedor = values.fornecedor?.nome?.trim();
        const ddd = values.fornecedor?.telefone?.ddd?.trim();
        const numero = values.fornecedor?.telefone?.numero?.trim();

        const hasTelefone = ddd || numero;
        const fieldErrors: Record<string, string> = {};

        if ((ddd && !numero) || (!ddd && numero)) {
            if (!ddd) fieldErrors['fornecedor.telefone.ddd'] = 'Preencha o DDD';
            if (!numero) fieldErrors['fornecedor.telefone.numero'] = 'Preencha o número';
        }

        if (numero && (numero.length < 8 || numero.length > 9)) {
            fieldErrors['fornecedor.telefone.numero'] = 'O número deve ter 8 ou 9 dígitos';
        }

        if (ddd && ddd.length !== 2) {
            fieldErrors['fornecedor.telefone.ddd'] = 'O DDD deve ter 2 dígitos';
        }

        if (hasTelefone && !nomeFornecedor) {
            fieldErrors['fornecedor.nome'] = 'Preencha o nome do fornecedor';
        }

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            notifications.show({
                message: 'Preencha todos os campos obrigatórios do fornecedor',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const payload = { ...values };
        if (!nomeFornecedor && !ddd && !numero) {
            payload.fornecedor = undefined as any;
        } else if (!ddd && !numero && payload.fornecedor) {
            payload.fornecedor = { ...payload.fornecedor, telefone: undefined as any };
        }

        const result = await createServicoTerceirizado(payload as ServicoTerceirizadoDTO);

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
            message: 'Serviço terceirizado criado com sucesso!',
            severity: 'success',
        });
        navigate('/app/servicos-terceirizados');
    }, [values, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, []);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Serviços Terceirizados', path: '/app/servicos-terceirizados' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={handleReset}
                backButtonPath="/app/servicos-terceirizados"
                permission={PERMISSOES.SERVICOS_TERCEIRIZADOS_CRIAR}
                isDirty={isDirty}
            >
                <ServicoTerceirizadoFormFields
                    servicoTerceirizado={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
