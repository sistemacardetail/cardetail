import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import CorVeiculoFormFields from './CorVeiculoFormFields';
import { CorVeiculoDTO, getCorVeiculoById, updateCorVeiculo } from './CorVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { Box, CircularProgress } from '@mui/material';
import { PERMISSOES } from '../../contexts/AuthContext';

export default function CorVeiculoEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = useState<Partial<CorVeiculoDTO>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const loadCor = async () => {
            if (!id) return;

            setLoading(true);
            const result = await getCorVeiculoById(id);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                navigate('/app/cadastros/cores');
                return;
            }

            if (result.data) {
                setValues(result.data);
            }
            setLoading(false);
        };

        loadCor();
    }, [id, navigate, notifications]);

    const handleChange = React.useCallback((field: keyof CorVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!id) return;

        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome da cor é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await updateCorVeiculo(id, values as CorVeiculoDTO);

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
            message: 'Cor atualizada com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/cores');
    }, [id, values, navigate, notifications]);

    if (loading) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Cadastros', path: '/app/cadastros' },
                    { title: 'Cores de Veículos', path: '/app/cadastros/cores' },
                    { title: 'Editar' },
                ]}
            >
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Cadastros', path: '/app/cadastros' },
                { title: 'Cores de Veículos', path: '/app/cadastros/cores' },
                { title: 'Editar' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                backButtonPath="/app/cadastros/cores"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <CorVeiculoFormFields
                    cor={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
