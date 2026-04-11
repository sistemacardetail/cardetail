import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { PacoteDTO } from './PacoteService';
import { searchServicosPacote, ServicoDTO } from '../servicos';
import { CustomSwitch } from '../components/CustomSwitch';
import MoneyInput from '../components/MoneyInput';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { searchTipos, TipoVeiculoDTO } from '../cadastros';
import { formatCurrency, formatDuration } from '../utils';
import { unaccent } from '../utils/string.utils';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
}

function SectionHeader({ icon, title, action }: Readonly<SectionHeaderProps>) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Box>
            {action}
        </Box>
    );
}

export interface PacoteFormFieldsProps {
    values: Partial<PacoteDTO>;
    onChange: (field: keyof PacoteDTO, value: any) => void;
    onAddServico: () => void;
    onRemoveServico: (index: number) => void;
    onServicoChange: (index: number, servico: ServicoDTO | null) => void;
    errors?: Record<string, string>;
}

export default function PacoteFormFields({
    values,
    onChange,
    onAddServico,
    onRemoveServico,
    onServicoChange,
    errors = {},
}: Readonly<PacoteFormFieldsProps>) {
    const isNew = !values.id;

    const [tiposVeiculos, setTiposVeiculos] = React.useState<TipoVeiculoDTO[]>([]);
    const [loadingTipos, setLoadingTipos] = React.useState(false);
    const [servicos, setServicos] = React.useState<ServicoDTO[]>([]);
    const [loadingServicos, setLoadingServicos] = React.useState(false);

    const servicosList = React.useMemo(() => values.servicos || [], [values.servicos]);

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [removeIndex, setRemoveIndex] = React.useState<number | null>(null);

    interface TiposVeiculoCache {
        tipos: TipoVeiculoDTO[];
    }

    const tiposVeiculosCache = React.useRef<TiposVeiculoCache>({ tipos: [] });

    interface ServicosCache {
        servicos: ServicoDTO[];
        tipoId?: string;
    }

    const servicosCache = React.useRef<ServicosCache>({ servicos: [], tipoId: undefined });

    const handleAskRemoveServico = (index: number) => {
        setRemoveIndex(index);
        setConfirmOpen(true);
    };

    const handleSearchTipos = React.useCallback(async (searchText: string) => {
        const searchNormalized = unaccent(searchText.toLowerCase());

        if (tiposVeiculosCache.current.tipos.length === 0) {
            setLoadingTipos(true);
            try {
                const { data } = await searchTipos('');
                if (data) {
                    tiposVeiculosCache.current.tipos = data;
                    setTiposVeiculos(
                        data.filter(t => unaccent(t.descricao.toLowerCase()).includes(searchNormalized))
                    );
                }
            } finally {
                setLoadingTipos(false);
            }
        } else {
            setTiposVeiculos(
                tiposVeiculosCache.current.tipos.filter(t =>
                    unaccent(t.descricao.toLowerCase()).includes(searchNormalized)
                )
            );
        }
    }, []);

    const handleSearchServicos = React.useCallback(
        async (searchText: string) => {
            const tipoId = values.tipoVeiculo?.id?.trim();
            if (!tipoId) {
                setServicos([]);
                servicosCache.current = { servicos: [] };
                return;
            }

            const searchNormalized = unaccent(searchText.toLowerCase());

            if (servicosCache.current.tipoId !== tipoId) {
                servicosCache.current = { servicos: [], tipoId };
                setServicos([]);
            }

            if (servicosCache.current.servicos.length === 0) {
                setLoadingServicos(true);
                try {
                    const { data } = await searchServicosPacote(searchText, tipoId);
                    if (data) {
                        servicosCache.current = { servicos: data, tipoId };
                        setServicos(
                            data.filter(s => unaccent(s.nome.toLowerCase()).includes(searchNormalized))
                        );
                    }
                } finally {
                    setLoadingServicos(false);
                }
            } else {
                setServicos(
                    servicosCache.current.servicos.filter(s =>
                        unaccent(s.nome.toLowerCase()).includes(searchNormalized)
                    )
                );
            }
        },
        [values.tipoVeiculo?.id]
    );

    React.useEffect(() => {
        handleSearchTipos('');

        if (values.tipoVeiculo?.id?.trim()) {
            handleSearchServicos('');
        }
    }, [values.tipoVeiculo?.id, handleSearchTipos, handleSearchServicos]);

    const tempoTotal = React.useMemo(() => {
        return servicosList.reduce((acc, s) => acc + (s.servico?.tempoExecucaoMin || 0), 0);
    }, [servicosList]);

    const somaValorServicos = React.useMemo(() => {
        return servicosList.reduce((acc, s) => acc + (s.servico?.valor || 0), 0);
    }, [servicosList]);

    const selectedServicoIds = React.useMemo(() => {
        return new Set(servicosList.map(s => s.servico?.id).filter(Boolean));
    }, [servicosList]);

    const isServicoCompativel = React.useCallback((servico: ServicoDTO | null | undefined): boolean => {
        if (!servico || !values.tipoVeiculo?.id) return true;
        return servico.tiposVeiculos?.some(tv => tv.tipo?.id === values.tipoVeiculo?.id) ?? false;
    }, [values.tipoVeiculo?.id]);

    const servicosIncompativeis = React.useMemo(() => {
        return servicosList.filter(s => s.servico && !isServicoCompativel(s.servico)).length;
    }, [servicosList, isServicoCompativel]);

    return (
        <>
            {/* DADOS DO PACOTE */}
            <Card
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <SectionHeader icon={<InventoryIcon />} title="Dados do Pacote" />
                    <Grid container spacing={3}>
                        <Grid size={8}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="Nome"
                                value={values.nome ?? ''}
                                onChange={(e) => onChange('nome', e.target.value)}
                                error={!!errors.nome}
                                helperText={errors.nome}
                            />
                        </Grid>

                        <Grid size={1}>
                            <FormControlLabel
                                sx={{
                                    width: '100%',
                                    margin: 0,
                                    justifyContent: 'flex-end',
                                }}
                                control={
                                    <CustomSwitch
                                        checked={values.ativo ?? false}
                                        onChange={(e) => onChange('ativo', e.target.checked)}
                                        disabled={isNew}
                                    />
                                }
                                label='Ativo'
                            />
                        </Grid>

                        <Grid size={8}>
                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                label="Descrição"
                                value={values.descricao ?? ''}
                                onChange={(e) => onChange('descricao', e.target.value)}
                            />
                        </Grid>

                        <Grid size={4}/>

                        <Grid size={4}>
                            <Autocomplete
                                fullWidth
                                size="small"
                                options={tiposVeiculos}
                                disabled={!!values?.id}
                                getOptionLabel={(option) => option?.descricao ?? ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingTipos}
                                value={values?.tipoVeiculo ?? null}
                                onChange={(_, newValue) => {
                                    onChange('tipoVeiculo', newValue ?? null);
                                }}
                                onInputChange={(_, newValue, reason) => {
                                    if (reason === 'input') {
                                        handleSearchTipos(newValue);
                                    }
                                }}
                                onOpen={() => {handleSearchTipos('')}}
                                noOptionsText="Nenhum tipo encontrado"
                                loadingText="Carregando..."
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tipo de Veículo"
                                        required
                                        error={!!errors.tipoVeiculo}
                                        helperText={errors.tipoVeiculo}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={2}>
                            <MoneyInput
                                fullWidth
                                size="small"
                                required
                                label="Valor Total"
                                value={values.valor}
                                onChange={(val) => onChange('valor', val)}
                                error={!!errors.valor}
                                helperText={errors.valor || (somaValorServicos > 0 ? `Soma dos serviços: ${formatCurrency(somaValorServicos)}` : '')}
                            />
                        </Grid>

                        <Grid size={2}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="Tempo de Execução"
                                type="number"
                                value={values.tempoExecucaoMin ?? tempoTotal}
                                onChange={(e) => onChange('tempoExecucaoMin', Number.parseInt(e.target.value) || 0)}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">min</InputAdornment>,
                                    },
                                }}
                                error={!!errors.tempoExecucaoMin}
                                helperText={errors.tempoExecucaoMin || (tempoTotal > 0 ? `Soma dos serviços: ${tempoTotal} min` : '')}
                            />
                        </Grid>

                        <Grid size={8}/>

                        <Grid size={8}>
                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                label="Observações do Pacote"
                                value={values.observacao ?? ''}
                                onChange={(e) => onChange('observacao', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* SERVIÇOS INCLUSOS */}
            <Card
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <SectionHeader
                        icon={<LocalCarWashIcon />}
                        title="Serviços Inclusos"
                        action={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {servicosIncompativeis > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: alpha('#f44336', 0.08),
                                            color: 'error.main',
                                        }}
                                    >
                                        <WarningAmberIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="caption" fontWeight={600}>
                                            {servicosIncompativeis} serviço(s) incompatível(is)
                                        </Typography>
                                    </Box>
                                )}
                                {!values.tipoVeiculo?.id && (
                                    <Typography variant="caption" color="text.secondary">
                                        Selecione um tipo de veículo primeiro
                                    </Typography>
                                )}
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={onAddServico}
                                    disabled={!values.tipoVeiculo?.id}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Adicionar
                                </Button>
                            </Box>
                        }
                    />

                    {servicosList.length === 0 ? (
                        <Typography
                            align="center"
                            color="text.secondary"
                            py={4}
                            sx={{ fontStyle: 'italic' }}
                        >
                            Nenhum serviço adicionado
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {servicosList.map((pacoteServico, index) => {
                                const isIncompativel = pacoteServico.servico && !isServicoCompativel(pacoteServico.servico);
                                return (
                                    <Card
                                        key={index}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: 2,
                                            borderColor: isIncompativel ? 'error.main' : 'divider',
                                            borderRadius: 2,
                                            bgcolor: isIncompativel ? alpha('#f44336', 0.02) : 'transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: isIncompativel ? 'error.dark' : 'primary.main',
                                                boxShadow: (theme) => `0 2px 8px ${alpha(isIncompativel ? theme.palette.error.main : theme.palette.primary.main, 0.1)}`,
                                            },
                                        }}
                                    >
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid size={5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {isIncompativel && (
                                                        <Tooltip title="Serviço incompatível com o tipo de veículo selecionado" arrow>
                                                            <WarningAmberIcon color="error" sx={{ fontSize: 20 }} />
                                                        </Tooltip>
                                                    )}
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        options={servicos.filter(s => !selectedServicoIds.has(s.id) || s.id === pacoteServico.servico?.id)}
                                                        getOptionLabel={(option) => option?.nome ?? ''}
                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                        loading={loadingServicos}
                                                        value={pacoteServico.servico ?? null}
                                                        onChange={(_, newValue) => onServicoChange(index, newValue)}
                                                        onOpen={() => handleSearchServicos('')}
                                                        onInputChange={(_, newValue, reason) => {
                                                            if (reason === 'input') {
                                                                handleSearchServicos(newValue);
                                                            }
                                                        }}
                                                        noOptionsText="Nenhum serviço encontrado"
                                                        loadingText="Carregando..."
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Serviço"
                                                                required
                                                                error={isIncompativel || (!!errors.servicos && !pacoteServico.servico)}
                                                                helperText={isIncompativel ? 'Incompatível com o tipo de veículo' : ''}
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid size={2}>
                                                <Typography variant="body2" color={isIncompativel ? 'error' : 'text.secondary'}>
                                                    {pacoteServico.servico ? formatCurrency(pacoteServico.servico.valor) : '-'}
                                                </Typography>
                                            </Grid>

                                            <Grid size={2}>
                                                <Typography variant="body2" color={isIncompativel ? 'error' : 'text.secondary'}>
                                                    {pacoteServico.servico ? formatDuration(pacoteServico.servico.tempoExecucaoMin) : '-'}
                                                </Typography>
                                            </Grid>

                                            <Grid size={1}>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleAskRemoveServico(index)}
                                                    sx={{
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}

                    {errors.servicos && servicosList.length === 0 && (
                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                            {errors.servicos}
                        </Typography>
                    )}
                </Box>
            </Card>

            <ConfirmDeleteDialog
                open={confirmOpen}
                payload={{
                    itemName: servicosList[removeIndex ?? 0]?.servico?.nome ?? '',
                    itemType: 'o serviço',
                }}
                onClose={async (confirmed) => {
                    setConfirmOpen(false);

                    if (confirmed && removeIndex !== null) {
                        onRemoveServico(removeIndex);
                    }

                    setRemoveIndex(null);
                }}
            />
        </>
    );
}
