import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { PERMISSOES } from '../contexts/AuthContext';
import {
    getServicoTerceirizadoById,
    ServicoTerceirizadoDTO,
    updateServicoTerceirizado
} from './ServicoTerceirizadoService';
import ServicoTerceirizadoFormFields from './ServicoTerceirizadoFormFields';

interface ServicoTerceirizadoEditFormProps {
    initialValues: ServicoTerceirizadoDTO;
    onSuccess: () => Promise<void>;
}

function ServicoTerceirizadoEditForm({ initialValues }: ServicoTerceirizadoEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const [values, setValues] = React.useState<Partial<ServicoTerceirizadoDTO>>(initialValues);
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
                message: 'O nome do serviço terceirizado é obrigatório',
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

        const result = await updateServicoTerceirizado(id!, payload as ServicoTerceirizadoDTO);

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
            message: 'Serviço terceirizado atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/servicos-terceirizados');
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
            backButtonPath="/app/servicos-terceirizados"
            permission={PERMISSOES.SERVICOS_TERCEIRIZADOS_EDITAR}
            isDirty={isDirty}
        >
            <ServicoTerceirizadoFormFields
                servicoTerceirizado={values}
                onChange={handleChange}
                errors={errors}
            />
        </CrudForm>
    );
}

export default function ServicoTerceirizadoEdit() {
    return (
        <CrudEdit<ServicoTerceirizadoDTO>
            title=""
            breadcrumbs={[
                { title: 'Serviços Terceirizados', path: '/app/servicos-terceirizados' },
                { title: 'Editar' },
            ]}
            loadFn={getServicoTerceirizadoById}
        >
            {(data, reload) => (
                <ServicoTerceirizadoEditForm initialValues={data} onSuccess={reload} />
            )}
        </CrudEdit>
    );
}
