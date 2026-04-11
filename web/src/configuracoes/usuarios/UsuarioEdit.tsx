import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import UsuarioFormFields, { UsuarioFormValues } from './UsuarioFormFields';
import { UsuarioService } from './UsuarioService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

export default function UsuarioEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<UsuarioFormValues | null>(null);
    const [originalValues, setOriginalValues] = React.useState<UsuarioFormValues | null>(null);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        const loadUsuario = async () => {
            if (!id) return;

            setLoading(true);
            const result = await UsuarioService.buscarPorId(id);

            if (result.error) {
                setLoadError(result.error);
            } else if (result.data) {
                const formValues: UsuarioFormValues = {
                    login: result.data.login,
                    nome: result.data.nome,
                    senha: '',
                    perfilId: result.data.perfil.id,
                    ativo: result.data.ativo,
                };
                setValues(formValues);
                setOriginalValues(formValues);
            }
            setLoading(false);
        };

        loadUsuario();
    }, [id]);

    const handleFieldChange = React.useCallback((field: keyof UsuarioFormValues, value: string | boolean | number | null) => {
        setValues((prev) => prev ? { ...prev, [field]: value } : null);
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const validate = React.useCallback(() => {
        if (!values) return false;

        const newErrors: Record<string, string> = {};

        if (!values.login.trim()) {
            newErrors.login = 'Login é obrigatório';
        }

        if (!values.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (!values.perfilId) {
            newErrors.perfilId = 'Perfil é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    const handleSubmit = React.useCallback(async () => {
        if (!validate() || !values || !id) {
            return;
        }

        const result = await UsuarioService.atualizar(id, {
            login: values.login,
            nome: values.nome,
            perfilId: values.perfilId!,
            ativo: values.ativo,
        });

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({ message: errorMessage, severity: 'error' });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({ message: 'Usuário atualizado com sucesso!', severity: 'success' });
        navigate('/app/configuracoes/usuarios');
    }, [values, id, validate, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        if (originalValues) {
            setValues(originalValues);
            setErrors({});
            setIsDirty(false);
        }
    }, [originalValues]);

    if (loading) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Configurações', path: '/app/configuracoes' },
                    { title: 'Usuários', path: '/app/configuracoes/usuarios' },
                    { title: 'Editar' },
                ]}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (loadError) {
        return (
            <PageContainer
                breadcrumbs={[
                    { title: 'Configurações', path: '/app/configuracoes' },
                    { title: 'Usuários', path: '/app/configuracoes/usuarios' },
                    { title: 'Editar' },
                ]}
            >
                <Alert severity="error">{loadError}</Alert>
            </PageContainer>
        );
    }

    if (!values) {
        return null;
    }

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Configurações', path: '/app/configuracoes' },
                { title: 'Usuários', path: '/app/configuracoes/usuarios' },
                { title: 'Editar' },
            ]}
        >
            <CrudForm onSubmit={handleSubmit}
                      onReset={handleReset}
                      backButtonPath="/app/configuracoes/usuarios"
                      permission={PERMISSOES.USUARIOS_EDITAR}
                      isDirty={isDirty}
            >
                <UsuarioFormFields
                    values={values}
                    errors={errors}
                    onFieldChange={handleFieldChange}
                    isEdit={true}
                    showPassword={false}
                />
            </CrudForm>
        </PageContainer>
    );
}
