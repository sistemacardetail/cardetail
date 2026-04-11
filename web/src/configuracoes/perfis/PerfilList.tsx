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
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import PageContainer from '../../components/PageContainer';
import { useNotifications } from '../../hooks/useNotifications';
import { useDialogs } from '../../hooks/useDialogs';
import { PerfilDTO, PerfilService } from '../usuarios';
import { PERMISSOES, useAuth } from '../../contexts/AuthContext';
import { PermissionPageGuard } from '../../components/PermissionGuard';

const PERFIS_PADRAO = ['ADMINISTRADOR', 'FUNCIONARIO'];

export default function PerfilList() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const dialogs = useDialogs();
    const { hasPermissao } = useAuth();

    const canCreate = hasPermissao(PERMISSOES.PERFIS_CRIAR);
    const canEdit = hasPermissao(PERMISSOES.PERFIS_EDITAR);
    const canDelete = hasPermissao(PERMISSOES.PERFIS_EXCLUIR);

    const [perfis, setPerfis] = React.useState<PerfilDTO[]>([]);
    const [filteredPerfis, setFilteredPerfis] = React.useState<PerfilDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const loadPerfis = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await PerfilService.listar();
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setPerfis(result.data);
                setFilteredPerfis(result.data);
            }
        } catch {
            setError('Erro ao carregar perfis');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadPerfis();
    }, [loadPerfis]);

    React.useEffect(() => {
        if (!searchTerm) {
            setFilteredPerfis(perfis);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredPerfis(
                perfis.filter(
                    (p) =>
                        p.nome.toLowerCase().includes(term) ||
                        (p.descricao && p.descricao.toLowerCase().includes(term))
                )
            );
        }
    }, [searchTerm, perfis]);

    const handleDelete = React.useCallback(
        async (perfil: PerfilDTO) => {
            if (PERFIS_PADRAO.includes(perfil.nome)) {
                notifications.show({
                    message: 'Perfis padrão do sistema não podem ser excluídos',
                    severity: 'warning'
                });
                return;
            }

            const ConfirmDeleteDialog = (await import('../../components/ConfirmDeleteDialog')).default;
            const confirmed = await dialogs.open(ConfirmDeleteDialog, {
                itemName: perfil.nome,
                itemType: 'o perfil',
            });

            if (confirmed) {
                const result = await PerfilService.excluir(perfil.id);
                if (result.error) {
                    notifications.show({ message: result.error, severity: 'error' });
                } else {
                    notifications.show({ message: 'Excluído com sucesso!', severity: 'success' });
                    loadPerfis();
                }
            }
        },
        [dialogs, notifications, loadPerfis]
    );

    const headerActions = canCreate ? (
        <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/app/configuracoes/perfis/novo')}
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
            Novo Perfil
        </Button>
    ) : null;

    return (
        <PermissionPageGuard permissao={PERMISSOES.PERFIS_VISUALIZAR}>
        <PageContainer
            title="Perfis de Acesso"
            description="Gerenciamento de perfis e permissões do sistema"
            icon={<SecurityIcon />}
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
                        placeholder="Buscar por nome ou descrição..."
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
                                        Nome
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Descrição
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Nível
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Permissões
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }} align="right">
                                        Ações
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPerfis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">Nenhum perfil encontrado</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPerfis.map((perfil) => (
                                        <TableRow
                                            key={perfil.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/app/configuracoes/perfis/${perfil.id}`)}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {perfil.nome}
                                                    </Typography>
                                                    {PERFIS_PADRAO.includes(perfil.nome) && (
                                                        <Chip label="Sistema" size="small" color="info" variant="outlined" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{perfil.descricao || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`Nível ${perfil.nivel}`}
                                                    size="small"
                                                    variant="outlined"
                                                    color={perfil.nivel === 1 ? 'error' : perfil.nivel === 2 ? 'warning' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${perfil.permissoes.length} permissões`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={perfil.ativo ? 'Ativo' : 'Inativo'}
                                                    size="small"
                                                    color={perfil.ativo ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                {canEdit && (
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/app/configuracoes/perfis/${perfil.id}`)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canDelete && !PERFIS_PADRAO.includes(perfil.nome) && (
                                                    <Tooltip title="Excluir">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(perfil)}
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
