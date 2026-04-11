import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import { AdminPanelSettings, ExpandMore as ExpandMoreIcon, LockPerson } from '@mui/icons-material';
import { PerfilCreateDTO, PerfilService, PermissaoDTO } from '../usuarios';
import Stack from '@mui/material/Stack';
import { CustomSwitch } from '../../components/CustomSwitch';
import { alpha } from '@mui/material/styles';

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

    const handleModuloToggle = (modulo: string) => {
        const permissoesDoModulo = permissoesAgrupadas[modulo] || [];
        const idsDoModulo = permissoesDoModulo.map((p) => p.id);
        const selecionadas = values.permissoesIds?.filter((id) => idsDoModulo.includes(id)) || [];
        const todasSelecionadas = selecionadas.length === idsDoModulo.length;

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

    const getModuloStatus = (modulo: string) => {
        const idsDoModulo = (permissoesAgrupadas[modulo] || []).map(p => p.id);
        const selecionadas = (values.permissoesIds ?? []).filter(id => idsDoModulo.includes(id)).length;

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
                            label={`${values.permissoesIds?.length ?? 0} selecionadas`}
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(permissoesAgrupadas).map(([modulo, permissoes]) => {
                                const status = getModuloStatus(modulo);
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
                                                        handleModuloToggle(modulo);
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
                        </Box>
                    )}
            </Card>
        </>
    );
}
