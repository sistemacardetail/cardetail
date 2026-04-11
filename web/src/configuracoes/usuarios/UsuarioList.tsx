import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import PageContainer from '../../components/PageContainer';
import { useNotifications } from '../../hooks/useNotifications';
import { useDialogs } from '../../hooks/useDialogs';
import { UsuarioDTO, UsuarioService } from './UsuarioService';
import { PERMISSOES, useAuth } from '../../contexts/AuthContext';
import { PermissionPageGuard } from '../../components/PermissionGuard';

export default function UsuarioList() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const { hasPermissao } = useAuth();

    const canCreate = hasPermissao(PERMISSOES.USUARIOS_CRIAR);
    const canEdit = hasPermissao(PERMISSOES.USUARIOS_EDITAR);
    const canDelete = hasPermissao(PERMISSOES.USUARIOS_EXCLUIR);

    const [usuarios, setUsuarios] = React.useState<UsuarioDTO[]>([]);
    const [filteredUsuarios, setFilteredUsuarios] = React.useState<UsuarioDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const loadUsuarios = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await UsuarioService.listar();
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setUsuarios(result.data);
                setFilteredUsuarios(result.data);
            }
        } catch {
            setError('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadUsuarios();
    }, [loadUsuarios]);

    React.useEffect(() => {
        if (!searchTerm) {
            setFilteredUsuarios(usuarios);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredUsuarios(
                usuarios.filter(
                    (u) =>
                        u.login.toLowerCase().includes(term) ||
                        u.nome.toLowerCase().includes(term) ||
                        u.perfil.nome.toLowerCase().includes(term)
                )
            );
        }
    }, [searchTerm, usuarios]);

    const handleDelete = React.useCallback(
        async (usuario: UsuarioDTO) => {
            const ConfirmDeleteDialog = (await import('../../components/ConfirmDeleteDialog')).default;
            const confirmed = await dialogs.open(ConfirmDeleteDialog, {
                itemName: usuario.nome,
                itemType: 'o usuário',
            });

            if (confirmed) {
                const result = await UsuarioService.excluir(usuario.id);
                if (result.error) {
                    notifications.show({ message: result.error, severity: 'error' });
                } else {
                    notifications.show({ message: 'Excluído com sucesso!', severity: 'success' });
                    loadUsuarios();
                }
            }
        },
        [dialogs, notifications, loadUsuarios]
    );

    const handleToggleAtivo = React.useCallback(
        async (usuario: UsuarioDTO) => {
            const action = usuario.ativo ? UsuarioService.desativar : UsuarioService.ativar;
            const result = await action(usuario.id);
            if (result.error) {
                notifications.show({ message: result.error, severity: 'error' });
            } else {
                notifications.show({
                    message: `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`,
                    severity: 'success',
                });
                loadUsuarios();
            }
        },
        [notifications, loadUsuarios]
    );

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('pt-BR');
    };

    const headerActions = canCreate ? (
        <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/app/configuracoes/usuarios/novo')}
            startIcon={<AddIcon />}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
            }}
        >
            Novo Usuário
        </Button>
    ) : null;

    return (
        <PermissionPageGuard permissao={PERMISSOES.USUARIOS_VISUALIZAR}>
        <PageContainer
            title="Usuários"
            description="Gerenciamento de usuários do sistema"
            icon={<PersonIcon />}
            actions={headerActions}
        >
            <Card
                elevation={0}
                sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar por login, nome ou perfil..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 350 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Login
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Nome
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Perfil
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Último Login
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }} align="right">
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">Nenhum usuário encontrado</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsuarios.map((usuario) => (
                                        <TableRow
                                            key={usuario.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/app/configuracoes/usuarios/${usuario.id}`)}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {usuario.login}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {usuario.nome}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={usuario.perfil.nome} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={usuario.ativo ? 'Ativo' : 'Inativo'}
                                                    size="small"
                                                    color={usuario.ativo ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(usuario.lastLogin)}</TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                {canEdit && (
                                                    <>
                                                        <Tooltip title={usuario.ativo ? 'Desativar' : 'Ativar'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleAtivo(usuario)}
                                                                color={usuario.ativo ? 'default' : 'success'}
                                                            >
                                                                {usuario.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => navigate(`/app/configuracoes/usuarios/${usuario.id}`)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {canDelete && (
                                                    <Tooltip title="Excluir">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(usuario)}
                                                            sx={{ '&:hover': { color: 'error.main' } }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </PageContainer>
        </PermissionPageGuard>
    );
}
