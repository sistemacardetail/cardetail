import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface UserInfo {
    id: string;
    login: string;
    nome: string;
    perfil: string;
    permissoes: string[];
    isAdmin: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean | null;
    user: UserInfo | null;
    permissoes: string[];
    setIsAuthenticated: (value: boolean | null) => void;
    refreshAuth: () => Promise<void>;
    hasPermissao: (codigo: string) => boolean;
    hasAnyPermissao: (...codigos: string[]) => boolean;
    hasAllPermissoes: (...codigos: string[]) => boolean;
    isAdmin: () => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: null,
    user: null,
    permissoes: [],
    setIsAuthenticated: () => {},
    refreshAuth: async () => {},
    hasPermissao: () => false,
    hasAnyPermissao: () => false,
    hasAllPermissoes: () => false,
    isAdmin: () => false,
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const usePermissao = (codigo: string): boolean => {
    const { hasPermissao } = useAuth();
    return hasPermissao(codigo);
};

export const useAnyPermissao = (...codigos: string[]): boolean => {
    const { hasAnyPermissao } = useAuth();
    return hasAnyPermissao(...codigos);
};

export const useIsAdmin = (): boolean => {
    const { isAdmin } = useAuth();
    return isAdmin();
};

export const PERMISSOES = {
    // Usuários
    USUARIOS_VISUALIZAR: 'USUARIOS_VISUALIZAR',
    USUARIOS_CRIAR: 'USUARIOS_CRIAR',
    USUARIOS_EDITAR: 'USUARIOS_EDITAR',
    USUARIOS_EXCLUIR: 'USUARIOS_EXCLUIR',

    // Perfis
    PERFIS_VISUALIZAR: 'PERFIS_VISUALIZAR',
    PERFIS_CRIAR: 'PERFIS_CRIAR',
    PERFIS_EDITAR: 'PERFIS_EDITAR',
    PERFIS_EXCLUIR: 'PERFIS_EXCLUIR',

    // Empresa
    EMPRESA_VISUALIZAR: 'EMPRESA_VISUALIZAR',
    EMPRESA_EDITAR: 'EMPRESA_EDITAR',

    // Cadastros
    CADASTROS_VISUALIZAR: 'CADASTROS_VISUALIZAR',
    CADASTROS_GERENCIAR: 'CADASTROS_GERENCIAR',

    // Clientes
    CLIENTES_VISUALIZAR: 'CLIENTES_VISUALIZAR',
    CLIENTES_CRIAR: 'CLIENTES_CRIAR',
    CLIENTES_EDITAR: 'CLIENTES_EDITAR',
    CLIENTES_EXCLUIR: 'CLIENTES_EXCLUIR',

    // Agendamentos
    AGENDAMENTOS_VISUALIZAR: 'AGENDAMENTOS_VISUALIZAR',
    AGENDAMENTOS_CRIAR: 'AGENDAMENTOS_CRIAR',
    AGENDAMENTOS_EDITAR: 'AGENDAMENTOS_EDITAR',
    AGENDAMENTOS_EXCLUIR: 'AGENDAMENTOS_EXCLUIR',

    // Pagamentos de Agendamento
    AGENDAMENTOS_PAGAMENTOS_VISUALIZAR: 'AGENDAMENTOS_PAGAMENTOS_VISUALIZAR',
    AGENDAMENTOS_PAGAMENTOS_CRIAR: 'AGENDAMENTOS_PAGAMENTOS_CRIAR',
    AGENDAMENTOS_PAGAMENTOS_EXCLUIR: 'AGENDAMENTOS_PAGAMENTOS_EXCLUIR',

    // Orçamentos
    ORCAMENTOS_VISUALIZAR: 'ORCAMENTOS_VISUALIZAR',
    ORCAMENTOS_CRIAR: 'ORCAMENTOS_CRIAR',
    ORCAMENTOS_EDITAR: 'ORCAMENTOS_EDITAR',
    ORCAMENTOS_EXCLUIR: 'ORCAMENTOS_EXCLUIR',

    // Serviços
    SERVICOS_VISUALIZAR: 'SERVICOS_VISUALIZAR',
    SERVICOS_CRIAR: 'SERVICOS_CRIAR',
    SERVICOS_EDITAR: 'SERVICOS_EDITAR',
    SERVICOS_EXCLUIR: 'SERVICOS_EXCLUIR',

    // Pacotes
    PACOTES_VISUALIZAR: 'PACOTES_VISUALIZAR',
    PACOTES_CRIAR: 'PACOTES_CRIAR',
    PACOTES_EDITAR: 'PACOTES_EDITAR',
    PACOTES_EXCLUIR: 'PACOTES_EXCLUIR',

    CONFIGURACAO_SISTEMA_GERENCIAR: 'CONFIGURACAO_SISTEMA_GERENCIAR',

    SERVICOS_TERCEIRIZADOS_VISUALIZAR: 'SERVICOS_TERCEIRIZADOS_VISUALIZAR',
    SERVICOS_TERCEIRIZADOS_CRIAR: 'SERVICOS_TERCEIRIZADOS_CRIAR',
    SERVICOS_TERCEIRIZADOS_EDITAR: 'SERVICOS_TERCEIRIZADOS_EDITAR',
    SERVICOS_TERCEIRIZADOS_EXCLUIR: 'SERVICOS_TERCEIRIZADOS_EXCLUIR',
} as const;

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<UserInfo | null>(null);

    const permissoes = useMemo(() => user?.permissoes ?? [], [user]);

    const hasPermissao = useCallback((codigo: string): boolean => {
        if (user?.isAdmin) return true;
        return permissoes.includes(codigo);
    }, [user, permissoes]);

    const hasAnyPermissao = useCallback((...codigos: string[]): boolean => {
        if (user?.isAdmin) return true;
        return codigos.some(codigo => permissoes.includes(codigo));
    }, [user, permissoes]);

    const hasAllPermissoes = useCallback((...codigos: string[]): boolean => {
        if (user?.isAdmin) return true;
        return codigos.every(codigo => permissoes.includes(codigo));
    }, [user, permissoes]);

    const isAdmin = useCallback((): boolean => {
        return user?.isAdmin ?? false;
    }, [user]);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('username');
        sessionStorage.removeItem('dashboard_calendar_state');
    }, []);

    const refreshAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/usuarios/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setIsAuthenticated(true);
                setUser({
                    id: userData.id,
                    login: userData.login,
                    nome: userData.nome,
                    perfil: userData.perfil?.nome || userData.perfil,
                    permissoes: userData.permissoes || [],
                    isAdmin: userData?.admin ?? false,
                });
                localStorage.setItem('username', userData.nome);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            setIsAuthenticated(false);
        }
    }, [logout]);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const value: AuthContextType = {
        isAuthenticated,
        user,
        permissoes,
        setIsAuthenticated,
        refreshAuth,
        hasPermissao,
        hasAnyPermissao,
        hasAllPermissoes,
        isAdmin,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
