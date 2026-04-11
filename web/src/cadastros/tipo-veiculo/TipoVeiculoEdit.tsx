import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import { getTipoVeiculoById, TipoVeiculoDTO, updateTipoVeiculo } from './TipoVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { Box, CircularProgress } from '@mui/material';
import TipoVeiculoFormFields from './TipoVeiculoFormFields';
import { PERMISSOES } from '../../contexts/AuthContext';

export default function TipoVeiculoEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = useState<Partial<TipoVeiculoDTO>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const loadTipo = async () => {
            if (!id) return;

            setLoading(true);
            const result = await getTipoVeiculoById(id);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                navigate('/app/cadastros/tipos-veiculos');
                return;
            }

            if (result.data) {
                setValues(result.data);
            }
            setLoading(false);
        };

        loadTipo();
    }, [id, navigate, notifications]);

    const handleChange = React.useCallback((field: keyof TipoVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!id) return;

        if (!values.descricao?.trim()) {
            notifications.show({
                message: 'A descrição do tipo é obrigatória',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await updateTipoVeiculo(id, values as TipoVeiculoDTO);

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
            message: 'Tipo de veículo atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/tipos-veiculos');
    }, [id, values, navigate, notifications]);

    if (loading) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Cadastros', path: '/app/cadastros' },
                    { title: 'Tipos de Veículos', path: '/app/cadastros/tipos-veiculos' },
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
                { title: 'Tipos de Veículos', path: '/app/cadastros/tipos-veiculos' },
                { title: 'Editar' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                backButtonPath="/app/cadastros/tipos-veiculos"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <TipoVeiculoFormFields
                    tipo={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
