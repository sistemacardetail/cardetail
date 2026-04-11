import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { CrudForm } from '../../components/crud';
import PageContainer from '../../components/PageContainer';
import UsuarioFormFields, { UsuarioFormValues } from './UsuarioFormFields';
import { UsuarioService } from './UsuarioService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { PERMISSOES } from '../../contexts/AuthContext';

const initialValues: UsuarioFormValues = {
    login: '',
    nome: '',
    senha: '',
    perfilId: null,
    ativo: true,
};

export default function UsuarioCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [values, setValues] = React.useState<UsuarioFormValues>(initialValues);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    const handleFieldChange = React.useCallback((field: keyof UsuarioFormValues, value: string | boolean | number | null) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const validate = React.useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!values.login.trim()) {
            newErrors.login = 'Login é obrigatório';
        }

        if (!values.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (!values.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (values.senha.length < 8) {
            newErrors.senha = 'Senha deve ter no mínimo 8 caracteres';
        }

        if (!values.perfilId) {
            newErrors.perfilId = 'Perfil é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            return;
        }

        const result = await UsuarioService.criar({
            login: values.login,
            nome: values.nome,
            senha: values.senha,
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

        notifications.show({ message: 'Usuário criado com sucesso!', severity: 'success' });
        navigate('/app/configuracoes/usuarios');
    }, [values, validate, navigate, notifications]);

    const handleReset = React.useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsDirty(false);
    }, []);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Configurações', path: '/app/configuracoes' },
                { title: 'Usuários', path: '/app/configuracoes/usuarios' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm onSubmit={handleSubmit}
                      onReset={handleReset}
                      backButtonPath="/app/configuracoes/usuarios"
                      permission={PERMISSOES.USUARIOS_CRIAR}
                      isDirty={isDirty}
            >
                <UsuarioFormFields
                    values={values}
                    errors={errors}
                    onFieldChange={handleFieldChange}
                    isEdit={false}
                />
            </CrudForm>
        </PageContainer>
    );
}
