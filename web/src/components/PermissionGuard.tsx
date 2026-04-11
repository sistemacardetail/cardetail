import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
    children: React.ReactNode;
    /** Permissão necessária para acessar o conteúdo */
    permissao?: string;
    /** Lista de permissões (qualquer uma dá acesso) */
    permissoes?: string[];
    /** Se true, todas as permissões são necessárias */
    requireAll?: boolean;
    /** Componente a ser exibido quando não tem permissão (default: mensagem padrão) */
    fallback?: React.ReactNode;
    /** Se true, esconde completamente ao invés de mostrar fallback */
    hide?: boolean;
}

/**
 * Componente que controla acesso baseado em permissões do usuário.
 *
 * Exemplos de uso:
 *
 * // Requer uma permissão específica
 * <PermissionGuard permissao="USUARIOS_CRIAR">
 *   <Button>Criar Usuário</Button>
 * </PermissionGuard>
 *
 * // Requer qualquer uma das permissões
 * <PermissionGuard permissoes={["USUARIOS_EDITAR", "USUARIOS_CRIAR"]}>
 *   <Button>Editar</Button>
 * </PermissionGuard>
 *
 * // Esconde completamente se não tiver permissão
 * <PermissionGuard permissao="USUARIOS_EXCLUIR" hide>
 *   <Button>Excluir</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permissao,
    permissoes,
    requireAll = false,
    fallback,
    hide = false,
}) => {
    const { hasPermissao, hasAnyPermissao, hasAllPermissoes } = useAuth();

    let hasAccess = true;

    if (permissao) {
        hasAccess = hasPermissao(permissao);
    } else if (permissoes && permissoes.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissoes(...permissoes)
            : hasAnyPermissao(...permissoes);
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (hide) {
        return null;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return null;
};

interface PermissionPageGuardProps {
    children: React.ReactNode;
    permissao?: string;
    permissoes?: string[];
    requireAll?: boolean;
}

export const PermissionPageGuard: React.FC<PermissionPageGuardProps> = ({
    children,
    permissao,
    permissoes,
    requireAll = false,
}) => {
    const navigate = useNavigate();
    const { hasPermissao, hasAnyPermissao, hasAllPermissoes } = useAuth();

    let hasAccess = true;

    if (permissao) {
        hasAccess = hasPermissao(permissao);
    } else if (permissoes && permissoes.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissoes(...permissoes)
            : hasAnyPermissao(...permissoes);
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 4,
            }}
        >
            <LockIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
                Acesso Negado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Você não tem permissão para acessar esta página.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate('/app')}
            >
                Voltar para o Dashboard
            </Button>
        </Box>
    );
};

interface PermissionAlertProps {
    message?: string;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({
    message = 'Usuário não possui permissão.',
}) => {
    return (
        <Alert severity="warning" sx={{ my: 2 }}>
            {message}
        </Alert>
    );
};

export default PermissionGuard;
