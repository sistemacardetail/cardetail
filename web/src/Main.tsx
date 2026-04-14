import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import NotificationsProvider from './hooks/NotificationsProvider';
import DialogsProvider from './hooks/DialogsProvider';
import { AuthProvider, PERMISSOES, useAuth } from './contexts/AuthContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import { UnsavedChangesProvider } from './contexts/UnsavedChangesContext';
import { setAuthErrorHandlers } from './services/apiService';
import { useNotifications } from './hooks/useNotifications';
import { PermissionPageGuard } from './components/PermissionGuard';

// Re-export useAuth para manter compatibilidade
export { useAuth } from './contexts/AuthContext';

const AppLayout = React.lazy(() => import('./layout/AppLayout').then(m => ({ default: m.AppLayout })));
const LoginForm = React.lazy(() => import('./login/LoginForm'));
const Home = React.lazy(() => import('./home/Home'));
const ClienteList = React.lazy(() => import('./clientes/ClienteList'));
const ClienteCreate = React.lazy(() => import('./clientes/ClienteCreate'));
const ClienteEdit = React.lazy(() => import('./clientes/ClienteEdit'));
const ServicoList = React.lazy(() => import('./servicos/ServicoList'));
const ServicoCreate = React.lazy(() => import('./servicos/ServicoCreate'));
const ServicoEdit = React.lazy(() => import('./servicos/ServicoEdit'));
const PacoteList = React.lazy(() => import('./pacotes/PacoteList'));
const PacoteCreate = React.lazy(() => import('./pacotes/PacoteCreate'));
const PacoteEdit = React.lazy(() => import('./pacotes/PacoteEdit'));
const AgendamentoList = React.lazy(() => import('./agendamentos/AgendamentoList'));
const AgendamentoCreate = React.lazy(() => import('./agendamentos/AgendamentoCreate'));
const AgendamentoEdit = React.lazy(() => import('./agendamentos/AgendamentoEdit'));
const OrcamentoList = React.lazy(() => import('./orcamentos/OrcamentoList'));
const OrcamentoCreate = React.lazy(() => import('./orcamentos/OrcamentoCreate'));
const OrcamentoEdit = React.lazy(() => import('./orcamentos/OrcamentoEdit'));
const ModeloVeiculoList = React.lazy(() => import('./cadastros/modelo-veiculo/ModeloVeiculoList'));
const ModeloVeiculoCreate = React.lazy(() => import('./cadastros/modelo-veiculo/ModeloVeiculoCreate'));
const ModeloVeiculoEdit = React.lazy(() => import('./cadastros/modelo-veiculo/ModeloVeiculoEdit'));
const CorVeiculoList = React.lazy(() => import('./cadastros/cor-veiculo/CorVeiculoList'));
const CorVeiculoCreate = React.lazy(() => import('./cadastros/cor-veiculo/CorVeiculoCreate'));
const CorVeiculoEdit = React.lazy(() => import('./cadastros/cor-veiculo/CorVeiculoEdit'));
const MarcaVeiculoList = React.lazy(() => import('./cadastros/marca-veiculo/MarcaVeiculoList'));
const MarcaVeiculoCreate = React.lazy(() => import('./cadastros/marca-veiculo/MarcaVeiculoCreate'));
const MarcaVeiculoEdit = React.lazy(() => import('./cadastros/marca-veiculo/MarcaVeiculoEdit'));
const TipoVeiculoList = React.lazy(() => import('./cadastros/tipo-veiculo/TipoVeiculoList'));
const TipoVeiculoCreate = React.lazy(() => import('./cadastros/tipo-veiculo/TipoVeiculoCreate'));
const TipoVeiculoEdit = React.lazy(() => import('./cadastros/tipo-veiculo/TipoVeiculoEdit'));
const UsuarioList = React.lazy(() => import('./configuracoes/usuarios/UsuarioList'));
const UsuarioCreate = React.lazy(() => import('./configuracoes/usuarios/UsuarioCreate'));
const UsuarioEdit = React.lazy(() => import('./configuracoes/usuarios/UsuarioEdit'));
const PerfilList = React.lazy(() => import('./configuracoes/perfis/PerfilList'));
const PerfilCreate = React.lazy(() => import('./configuracoes/perfis/PerfilCreate'));
const PerfilEdit = React.lazy(() => import('./configuracoes/perfis/PerfilEdit'));
const EmpresaForm = React.lazy(() => import('./configuracoes/empresa/EmpresaForm'));
const SistemaForm = React.lazy(() => import('./configuracoes/sistema/SistemaForm'));
const ServicoTerceirizadoList = React.lazy(() => import('./servicos-terceirizados/ServicoTerceirizadoList'));
const ServicoTerceirizadoCreate = React.lazy(() => import('./servicos-terceirizados/ServicoTerceirizadoCreate'));
const ServicoTerceirizadoEdit = React.lazy(() => import('./servicos-terceirizados/ServicoTerceirizadoEdit'));
const ConsultaFaturamento = React.lazy(() => import('./consultas/ConsultaFaturamento'));
const ConsultaClientes = React.lazy(() => import('./consultas/ConsultaClientes'));

const RouteLoading: React.FC = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
    }}>
        Carregando...
    </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, refreshAuth } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/app' && isAuthenticated !== null) {
            refreshAuth();
        }
    }, [location.pathname, isAuthenticated, refreshAuth]);

    if (isAuthenticated === null) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Verificando autenticação...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const LoginRedirect: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated === null) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Carregando...
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />;
};

// Componente para configurar handlers de erro de API
const ApiErrorHandlerSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { logout } = useAuth();

    useEffect(() => {
        setAuthErrorHandlers(
            // Handler para 401 (não autenticado)
            () => {
                logout();
                navigate('/login', { replace: true });
            },
            // Handler para 403 (sem permissão)
            (message: string) => {
                notifications.show({
                    message,
                    severity: 'error',
                });
            }
        );
    }, [navigate, notifications, logout]);

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationsProvider>
                    <DialogsProvider>
                        <ApiErrorHandlerSetup>
                            <Suspense fallback={<RouteLoading />}>
                            <Routes>
                                <Route path="/" element={<LoginRedirect />} />
                                <Route path="/login" element={<LoginForm />} />
                                <Route
                                    path="/app"
                                    element={
                                        <ProtectedRoute>
                                            <EmpresaProvider>
                                                <UnsavedChangesProvider>
                                                    <AppLayout />
                                                </UnsavedChangesProvider>
                                            </EmpresaProvider>
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Home />} />

                                    {/* Clientes */}
                                    <Route path="clientes" element={<PermissionPageGuard permissao={PERMISSOES.CLIENTES_VISUALIZAR}><ClienteList /></PermissionPageGuard>} />
                                    <Route path="clientes/novo" element={<PermissionPageGuard permissao={PERMISSOES.CLIENTES_CRIAR}><ClienteCreate /></PermissionPageGuard>} />
                                    <Route path="clientes/:id" element={<PermissionPageGuard permissao={PERMISSOES.CLIENTES_EDITAR}><ClienteEdit /></PermissionPageGuard>} />

                                    {/* Serviços */}
                                    <Route path="servicos" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_VISUALIZAR}><ServicoList /></PermissionPageGuard>} />
                                    <Route path="servicos/novo" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_CRIAR}><ServicoCreate /></PermissionPageGuard>} />
                                    <Route path="servicos/:id" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_EDITAR}><ServicoEdit /></PermissionPageGuard>} />

                                    {/* Pacotes */}
                                    <Route path="pacotes" element={<PermissionPageGuard permissao={PERMISSOES.PACOTES_VISUALIZAR}><PacoteList /></PermissionPageGuard>} />
                                    <Route path="pacotes/novo" element={<PermissionPageGuard permissao={PERMISSOES.PACOTES_CRIAR}><PacoteCreate /></PermissionPageGuard>} />
                                    <Route path="pacotes/:id" element={<PermissionPageGuard permissao={PERMISSOES.PACOTES_EDITAR}><PacoteEdit /></PermissionPageGuard>} />

                                    {/* Agendamentos */}
                                    <Route path="agendamentos" element={<PermissionPageGuard permissao={PERMISSOES.AGENDAMENTOS_VISUALIZAR}><AgendamentoList /></PermissionPageGuard>} />
                                    <Route path="agendamentos/novo" element={<PermissionPageGuard permissao={PERMISSOES.AGENDAMENTOS_CRIAR}><AgendamentoCreate /></PermissionPageGuard>} />
                                    <Route path="agendamentos/:id" element={<PermissionPageGuard permissao={PERMISSOES.AGENDAMENTOS_EDITAR}><AgendamentoEdit /></PermissionPageGuard>} />

                                    {/* Orçamentos */}
                                    <Route path="orcamentos" element={<PermissionPageGuard permissao={PERMISSOES.ORCAMENTOS_VISUALIZAR}><OrcamentoList /></PermissionPageGuard>} />
                                    <Route path="orcamentos/novo" element={<PermissionPageGuard permissao={PERMISSOES.ORCAMENTOS_CRIAR}><OrcamentoCreate /></PermissionPageGuard>} />
                                    <Route path="orcamentos/:id" element={<PermissionPageGuard permissao={PERMISSOES.ORCAMENTOS_EDITAR}><OrcamentoEdit /></PermissionPageGuard>} />

                                    {/* Cadastros - Modelos de Veículos */}
                                    <Route path="cadastros/modelos" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_VISUALIZAR}><ModeloVeiculoList /></PermissionPageGuard>} />
                                    <Route path="cadastros/modelos/novo" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><ModeloVeiculoCreate /></PermissionPageGuard>} />
                                    <Route path="cadastros/modelos/:id" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><ModeloVeiculoEdit /></PermissionPageGuard>} />

                                    {/* Cadastros - Cores de Veículos */}
                                    <Route path="cadastros/cores" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_VISUALIZAR}><CorVeiculoList /></PermissionPageGuard>} />
                                    <Route path="cadastros/cores/novo" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><CorVeiculoCreate /></PermissionPageGuard>} />
                                    <Route path="cadastros/cores/:id" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><CorVeiculoEdit /></PermissionPageGuard>} />

                                    {/* Cadastros - Marcas de Veículos */}
                                    <Route path="cadastros/marcas" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_VISUALIZAR}><MarcaVeiculoList /></PermissionPageGuard>} />
                                    <Route path="cadastros/marcas/novo" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><MarcaVeiculoCreate /></PermissionPageGuard>} />
                                    <Route path="cadastros/marcas/:id" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><MarcaVeiculoEdit /></PermissionPageGuard>} />

                                    {/* Cadastros - Tipos de Veículos */}
                                    <Route path="cadastros/tipos-veiculos" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_VISUALIZAR}><TipoVeiculoList /></PermissionPageGuard>} />
                                    <Route path="cadastros/tipos-veiculos/novo" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><TipoVeiculoCreate /></PermissionPageGuard>} />
                                    <Route path="cadastros/tipos-veiculos/:id" element={<PermissionPageGuard permissao={PERMISSOES.CADASTROS_GERENCIAR}><TipoVeiculoEdit /></PermissionPageGuard>} />

                                    {/* Configurações - Usuários */}
                                    <Route path="configuracoes/usuarios" element={<PermissionPageGuard permissao={PERMISSOES.USUARIOS_VISUALIZAR}><UsuarioList /></PermissionPageGuard>} />
                                    <Route path="configuracoes/usuarios/novo" element={<PermissionPageGuard permissao={PERMISSOES.USUARIOS_CRIAR}><UsuarioCreate /></PermissionPageGuard>} />
                                    <Route path="configuracoes/usuarios/:id" element={<PermissionPageGuard permissao={PERMISSOES.USUARIOS_EDITAR}><UsuarioEdit /></PermissionPageGuard>} />

                                    {/* Configurações - Perfis */}
                                    <Route path="configuracoes/perfis" element={<PermissionPageGuard permissao={PERMISSOES.PERFIS_VISUALIZAR}><PerfilList /></PermissionPageGuard>} />
                                    <Route path="configuracoes/perfis/novo" element={<PermissionPageGuard permissao={PERMISSOES.PERFIS_CRIAR}><PerfilCreate /></PermissionPageGuard>} />
                                    <Route path="configuracoes/perfis/:id" element={<PermissionPageGuard permissao={PERMISSOES.PERFIS_EDITAR}><PerfilEdit /></PermissionPageGuard>} />

                                    {/* Configurações - Empresa */}
                                    <Route path="configuracoes/empresa" element={<PermissionPageGuard permissao={PERMISSOES.EMPRESA_VISUALIZAR}><EmpresaForm /></PermissionPageGuard>} />

                                    {/* Configurações - Sistema */}
                                    <Route path="configuracoes/sistema" element={<PermissionPageGuard permissao={PERMISSOES.CONFIGURACAO_SISTEMA_GERENCIAR}><SistemaForm /></PermissionPageGuard>} />

                                    <Route path="servicos-terceirizados" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_TERCEIRIZADOS_VISUALIZAR}><ServicoTerceirizadoList /></PermissionPageGuard>} />
                                    <Route path="servicos-terceirizados/novo" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_TERCEIRIZADOS_CRIAR}><ServicoTerceirizadoCreate /></PermissionPageGuard>} />
                                    <Route path="servicos-terceirizados/:id" element={<PermissionPageGuard permissao={PERMISSOES.SERVICOS_TERCEIRIZADOS_EDITAR}><ServicoTerceirizadoEdit /></PermissionPageGuard>} />

                                    {/* Consultas */}
                                    <Route path="consultas/clientes" element={<PermissionPageGuard permissao={PERMISSOES.CLIENTES_VISUALIZAR}><ConsultaClientes /></PermissionPageGuard>} />
                                    <Route path="consultas/faturamento" element={<PermissionPageGuard permissao={PERMISSOES.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR}><ConsultaFaturamento /></PermissionPageGuard>} />
                                    <Route path="consultas/agendamentos" element={<PermissionPageGuard permissao={PERMISSOES.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR}><ConsultaFaturamento /></PermissionPageGuard>} />
                                </Route>
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                            </Suspense>
                        </ApiErrorHandlerSetup>
                    </DialogsProvider>
                </NotificationsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <CssBaseline />
            <AppRoutes />
        </ThemeProvider>
    </React.StrictMode>
);
