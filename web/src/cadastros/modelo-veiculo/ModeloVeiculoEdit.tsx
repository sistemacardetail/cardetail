import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import ModeloVeiculoFormFields from './ModeloVeiculoFormFields';
import { getModeloVeiculoById, ModeloVeiculoDTO, updateModeloVeiculo } from './ModeloVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { Box, CircularProgress } from '@mui/material';
import { PERMISSOES } from '../../contexts/AuthContext';

export default function ModeloVeiculoEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = useState<Partial<ModeloVeiculoDTO>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const loadModelo = async () => {
            if (!id) return;

            setLoading(true);
            const result = await getModeloVeiculoById(id);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                navigate('/app/cadastros/modelos');
                return;
            }

            if (result.data) {
                setValues(result.data);
            }
            setLoading(false);
        };

        loadModelo();
    }, [id, navigate, notifications]);

    const handleChange = React.useCallback((field: keyof ModeloVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!id) return;

        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome do modelo é obrigatório',
                severity: 'error',
            });
            return;
        }

        if (!values.marca) {
            notifications.show({
                message: 'A marca é obrigatória',
                severity: 'error',
            });
            return;
        }

        if (!values.tipo) {
            notifications.show({
                message: 'O tipo de veículo é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await updateModeloVeiculo(id, values as ModeloVeiculoDTO);

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
            message: 'Modelo atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/modelos');
    }, [id, values, navigate, notifications]);

    if (loading) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Cadastros', path: '/app/cadastros' },
                    { title: 'Modelos de Veículos', path: '/app/cadastros/modelos' },
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
                { title: 'Modelos de Veículos', path: '/app/cadastros/modelos' },
                { title: 'Editar' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                backButtonPath="/app/cadastros/modelos"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <ModeloVeiculoFormFields
                    modelo={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
