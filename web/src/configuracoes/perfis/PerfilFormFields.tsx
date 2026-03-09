import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AdminPanelSettings,
    ClearAll,
    DoneAll,
    ExpandMore as ExpandMoreIcon,
    LockPerson,
    Search,
} from '@mui/icons-material';
import { PerfilCreateDTO, PerfilService, PermissaoDTO } from '../usuarios';
import Stack from '@mui/material/Stack';
import { CustomSwitch } from '../../components/CustomSwitch';
import { alpha } from '@mui/material/styles';
import { unaccent } from '../../utils/string.utils';

export interface PerfilFormValues {
    nome: string;
    descricao: string;
    nivel: number;
    ativo: boolean;
    permissoesIds: number[];
}

interface PerfilFormFieldsProps {
    values: Partial<PerfilCreateDTO>;
    errors: Record<string, string>;
    onFieldChange: (field: keyof PerfilFormValues, value: string | number | boolean | number[]) => void;
    isPerfilPadrao?: boolean;
}

const MODULO_LABELS: Record<string, string> = {
    CONFIGURACOES: 'Configurações',
    CLIENTES: 'Clientes',
    AGENDAMENTOS: 'Agendamentos',
    ORCAMENTOS: 'Orçamentos',
    SERVICOS: 'Serviços',
    PACOTES: 'Pacotes',
    CADASTROS: 'Cadastros',
    CONFIGURACAO_SISTEMA: 'Configuração do Sistema',
    SERVICO_TERCEIRIZADO: 'Serviços Terceirizados',
    FINANCEIRO: 'Financeiro',
};

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
}

function SectionHeader({ icon, title, action }: SectionHeaderProps) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: 'divider',
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Stack>
            {action}
        </Stack>
    );
}

export default function PerfilFormFields({
    values,
    errors,
    onFieldChange,
    isPerfilPadrao = false,
}: PerfilFormFieldsProps) {
    const [permissoesAgrupadas, setPermissoesAgrupadas] = React.useState<Record<string, PermissaoDTO[]>>({});
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [expandedModulos, setExpandedModulos] = React.useState<string[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
    const isAdministrador = isPerfilPadrao && values.nome === 'ADMINISTRADOR';

    React.useEffect(() => {
        const loadPermissoes = async () => {
            setLoading(true);
            const result = await PerfilService.listarPermissoesAgrupadas();
            if (result.error) {
                setLoadError(result.error);
            } else if (result.data) {
                setPermissoesAgrupadas(result.data);
                setExpandedModulos(Object.keys(result.data));
            }
            setLoading(false);
        };
        loadPermissoes();
    }, []);

    const handlePermissaoToggle = (permissaoId: number) => {
        const current = values.permissoesIds ?? [];
        const newPermissoes = current.includes(permissaoId)
            ? current.filter((id) => id !== permissaoId)
            : [...current, permissaoId];
        onFieldChange('permissoesIds', newPermissoes);
    };

    const handleModuloToggleFiltered = (permissoes: PermissaoDTO[]) => {
        const idsDoModulo = permissoes.map((p) => p.id);
        const selecionadas = (values.permissoesIds ?? []).filter((id) => idsDoModulo.includes(id));
        const todasSelecionadas = idsDoModulo.length > 0 && selecionadas.length === idsDoModulo.length;

        let novasPermissoes: number[];
        if (todasSelecionadas) {
            novasPermissoes = (values.permissoesIds ?? []).filter((id) => !idsDoModulo.includes(id));
        } else {
            novasPermissoes = Array.from(new Set([...(values.permissoesIds ?? []), ...idsDoModulo]));
        }

        onFieldChange('permissoesIds', novasPermissoes);
    };

    const handleExpandModulo = (modulo: string) => {
        setExpandedModulos((prev) =>
            prev.includes(modulo) ? prev.filter((m) => m !== modulo) : [...prev, modulo]
        );
    };

    const getModuloStatusFiltered = (permissoes: PermissaoDTO[]) => {
        const idsDoModulo = permissoes.map((p) => p.id);
        const selecionadas = (values.permissoesIds ?? []).filter((id) => idsDoModulo.includes(id)).length;

        if (selecionadas === 0) return 'none';
        if (selecionadas === idsDoModulo.length) return 'all';
        return 'partial';
    };

    const formatPermissaoLabel = (codigo: string) => {
        const parts = codigo.split('_');
        if (parts.length < 2) return codigo;

        const acao = parts[parts.length - 1];
        const acaoLabels: Record<string, string> = {
            VISUALIZAR: 'Visualizar',
            CRIAR: 'Criar',
            EDITAR: 'Editar',
            EXCLUIR: 'Excluir',
            GERENCIAR: 'Gerenciar',
        };

        return acaoLabels[acao] || acao;
    };

    const selectedIdsSet = React.useMemo(() => new Set(values.permissoesIds ?? []), [values.permissoesIds]);

    const moduloEntriesFiltradas = React.useMemo(() => {
        const query = unaccent(searchTerm.trim().toLowerCase());
        const hasQuery = query.length > 0;

        return Object.entries(permissoesAgrupadas)
            .map(([modulo, permissoes]) => {
                const moduloLabel = MODULO_LABELS[modulo] || modulo;
                const permissoesFiltradas = permissoes.filter((permissao) => {
                    if (showSelectedOnly && !selectedIdsSet.has(permissao.id)) return false;
                    if (!hasQuery) return true;

                    const target = [
                        moduloLabel,
                        permissao.codigo,
                        permissao.descricao || '',
                        formatPermissaoLabel(permissao.codigo),
                    ]
                        .join(' ')
                        .toLowerCase();

                    return unaccent(target).includes(query);
                });

                return [modulo, permissoesFiltradas] as const;
            })
            .filter(([, permissoes]) => permissoes.length > 0)
            .sort(([moduloA], [moduloB]) => {
                const labelA = MODULO_LABELS[moduloA] || moduloA;
                const labelB = MODULO_LABELS[moduloB] || moduloB;
                return labelA.localeCompare(labelB);
            });
    }, [permissoesAgrupadas, searchTerm, showSelectedOnly, selectedIdsSet]);

    const totalPermissoes = React.useMemo(
        () => Object.values(permissoesAgrupadas).reduce((acc, permissoes) => acc + permissoes.length, 0),
        [permissoesAgrupadas]
    );

    const filteredPermissionIds = React.useMemo(
        () => moduloEntriesFiltradas.flatMap(([, permissoes]) => permissoes.map((p) => p.id)),
        [moduloEntriesFiltradas]
    );

    const allFilteredSelected =
        filteredPermissionIds.length > 0 && filteredPermissionIds.every((id) => selectedIdsSet.has(id));

    const handleSelectFiltered = () => {
        if (filteredPermissionIds.length === 0) return;
        const novasPermissoes = Array.from(new Set([...(values.permissoesIds ?? []), ...filteredPermissionIds]));
        onFieldChange('permissoesIds', novasPermissoes);
    };

    const handleClearFiltered = () => {
        const filteredSet = new Set(filteredPermissionIds);
        const novasPermissoes = (values.permissoesIds ?? []).filter((id) => !filteredSet.has(id));
        onFieldChange('permissoesIds', novasPermissoes);
    };

    return (
        <>
            <Card
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <SectionHeader
                    icon={<AdminPanelSettings sx={{ color: 'primary.main', fontSize: 22 }} />}
                    title="Dados do Perfil"
                />
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="Nome"
                                value={values.nome ?? ''}
                                onChange={(e) => onFieldChange('nome', e.target.value)}
                                error={!!errors.nome}
                                helperText={errors.nome}
                                disabled={isPerfilPadrao}
                            />
                        </Grid>

                        <Grid size={1}>
                            <FormControlLabel
                                control={
                                    <CustomSwitch
                                        disabled={isPerfilPadrao}
                                        checked={values.ativo ?? false}
                                        onChange={(e) => onFieldChange('ativo', e.target.checked)}
                                    />
                                }
                                label='Ativo'
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="Descrição"
                                value={values.descricao ?? ''}
                                onChange={(e) => onFieldChange('descricao', e.target.value)}
                                error={!!errors.descricao}
                                helperText={errors.descricao}
                                disabled={isPerfilPadrao}
                            />
                        </Grid>

                        <Grid size={6}/>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                required
                                label="Nível"
                                value={values.nivel ?? ''}
                                onChange={(e) => onFieldChange('nivel', e.target.value)}
                                error={!!errors.nivel}
                                helperText={errors.nivel || 'Menor = mais privilégios'}
                                disabled={isPerfilPadrao}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Card>

            <Card
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <SectionHeader
                    icon={<LockPerson sx={{ color: 'primary.main', fontSize: 22 }} />}
                    title="Permissões"
                    action={
                    <>
                        <Chip
                            label={`${values.permissoesIds?.length ?? 0} de ${totalPermissoes} selecionadas`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </>
                    }
                />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : loadError ? (
                        <Alert severity="error">{loadError}</Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                            <Stack spacing={1.5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Filtrar por módulo, ação ou descrição da permissão"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                                    <FormControlLabel
                                        control={
                                            <CustomSwitch
                                                checked={showSelectedOnly}
                                                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                                            />
                                        }
                                        label="Mostrar somente selecionadas"
                                    />

                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Tooltip title="Seleciona todas as permissões exibidas no filtro atual">
                                            <span>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DoneAll />}
                                                    onClick={handleSelectFiltered}
                                                    disabled={isAdministrador || filteredPermissionIds.length === 0 || allFilteredSelected}
                                                >
                                                    Selecionar
                                                </Button>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Remove apenas as permissões exibidas no filtro atual">
                                            <span>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<ClearAll />}
                                                    onClick={handleClearFiltered}
                                                    disabled={isAdministrador || filteredPermissionIds.length === 0}
                                                >
                                                    Limpar
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 1 }} />

                            {moduloEntriesFiltradas.length === 0 ? (
                                <Alert severity="info">Nenhuma permissão encontrada para os filtros aplicados.</Alert>
                            ) : moduloEntriesFiltradas.map(([modulo, permissoes]) => {
                                const status = getModuloStatusFiltered(permissoes);
                                const isExpanded = expandedModulos.includes(modulo);

                                return (
                                    <Accordion
                                        key={modulo}
                                        expanded={isExpanded}
                                        onChange={() => handleExpandModulo(modulo)}
                                        sx={{
                                            '&:before': { display: 'none' },
                                            boxShadow: 'none',
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: '8px !important',
                                            '&:not(:last-child)': { mb: 1 },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                bgcolor: status === 'all' ? 'success.50' : status === 'partial' ? 'warning.50' : 'transparent',
                                                borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                <Checkbox
                                                    checked={status === 'all'}
                                                    indeterminate={status === 'partial'}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleModuloToggleFiltered(permissoes);
                                                    }}
                                                    disabled={isAdministrador}
                                                    onClick={(e) => e.stopPropagation()}
                                                    color="primary"
                                                />
                                                <Typography fontWeight={500}>
                                                    {MODULO_LABELS[modulo] || modulo}
                                                </Typography>
                                                <Chip
                                                    label={`${permissoes.filter((p) => values.permissoesIds?.includes(p.id)).length}/${permissoes.length}`}
                                                    size="small"
                                                    variant="outlined"
                                                    color={status === 'all' ? 'success' : status === 'partial' ? 'warning' : 'default'}
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ pt: 0 }}>
                                            <FormGroup sx={{ pl: 4 }}>
                                                {permissoes.map((permissao) => (
                                                    <FormControlLabel
                                                        key={permissao.id}
                                                        control={
                                                            <Checkbox
                                                                disabled={isAdministrador}
                                                                checked={values.permissoesIds?.includes(permissao.id)}
                                                                onChange={() => handlePermissaoToggle(permissao.id)}
                                                                size="small"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {formatPermissaoLabel(permissao.codigo)}
                                                                </Typography>
                                                                {permissao.descricao && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {permissao.descricao}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                ))}
                                            </FormGroup>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}

                            {!!errors.permissoes && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    {errors.permissoes}
                                </Alert>
                            )}
                        </Box>
                    )}
            </Card>
        </>
    );
}
