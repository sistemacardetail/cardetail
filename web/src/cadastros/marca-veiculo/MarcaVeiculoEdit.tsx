import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import MarcaVeiculoFormFields from './MarcaVeiculoFormFields';
import { getMarcaVeiculoById, MarcaVeiculoDTO, updateMarcaVeiculo } from './MarcaVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { Box, CircularProgress } from '@mui/material';
import { PERMISSOES } from '../../contexts/AuthContext';

export default function MarcaVeiculoEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = useState<Partial<MarcaVeiculoDTO>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const loadMarca = async () => {
            if (!id) return;

            setLoading(true);
            const result = await getMarcaVeiculoById(id);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                navigate('/app/cadastros/marcas');
                return;
            }

            if (result.data) {
                setValues(result.data);
            }
            setLoading(false);
        };

        loadMarca();
    }, [id, navigate, notifications]);

    const handleChange = React.useCallback((field: keyof MarcaVeiculoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleSubmit = React.useCallback(async () => {
        if (!id) return;

        if (!values.nome?.trim()) {
            notifications.show({
                message: 'O nome da marca é obrigatório',
                severity: 'error',
            });
            return;
        }

        setErrors({});

        const result = await updateMarcaVeiculo(id, values as MarcaVeiculoDTO);

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
            message: 'Marca atualizada com sucesso!',
            severity: 'success',
        });
        navigate('/app/cadastros/marcas');
    }, [id, values, navigate, notifications]);

    if (loading) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Cadastros', path: '/app/cadastros' },
                    { title: 'Marcas de Veículos', path: '/app/cadastros/marcas' },
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
                { title: 'Marcas de Veículos', path: '/app/cadastros/marcas' },
                { title: 'Editar' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                backButtonPath="/app/cadastros/marcas"
                permission={PERMISSOES.CADASTROS_GERENCIAR}
                isDirty={isDirty}
            >
                <MarcaVeiculoFormFields
                    marca={values}
                    onChange={handleChange}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
