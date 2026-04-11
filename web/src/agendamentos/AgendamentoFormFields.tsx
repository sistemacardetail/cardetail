import React, { useCallback, useRef } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SectionHeader from '../components/SectionHeader';
import VeiculoAutocomplete from '../components/VeiculoAutocomplete';
import StatusChip from '../components/StatusChip';
import { formatCurrency, formatDuration } from '../utils';
import MoneyInput from '../components/MoneyInput';
import { AgendamentoDTO } from './AgendamentoService';
import { VeiculoDTO } from '../clientes/ClienteService';
import { PacoteDTO, searchPacotesAgendamento } from '../pacotes';
import {
    getServicoSelecionavelKey,
    mapServicoInternoToSelecionavel,
    mapServicoTerceirizadoToSelecionavel,
    searchServicosAgendamento,
    ServicoSelecionavelDTO
} from '../servicos';
import { DateRangeIcon, TimeIcon } from '@mui/x-date-pickers/icons';
import { AutoAwesome, InfoOutlined } from '@mui/icons-material';
import DayAvailabilityTimeline from './DayAvailabilityTimeline';
import DateTimeRangeField from '../components/DateTimeRangeField';
import dayjs from 'dayjs';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { unaccent } from '../utils/string.utils';
import { searchServicosTerceirizadosAgendamento } from '../servicos-terceirizados';

export interface AgendamentoFormFieldsProps {
    values: Partial<AgendamentoDTO>;
    onChange: (field: keyof AgendamentoDTO, value: any) => void;
    onPeriodoChange?: (inicio: string | null, fim: string | null) => void;
    onVeiculoChange: (veiculo: VeiculoDTO | null) => void;
    onPacoteChange: (pacote: PacoteDTO | null) => void;
    onAddServico: () => void;
    onRemoveServico: (index: number) => void;
    onServicoChange: (index: number, servico: ServicoSelecionavelDTO | null) => void;
    onServicoValorChange: (index: number, valor: number) => void;
    valorTotal: number;
    valorFinal: number;
    tempoEstimadoTotal: number;
    errors?: Record<string, string>;
    initialClienteId?: string;
    agendamentoId?: string; // para excluir o próprio agendamento da timeline ao editar
}

const cardStyles = {
    elevation: 0,
    sx: {
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme: any) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
    },
};

const servicoCardStyles = {
    elevation: 0,
    sx: {
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme: any) => `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
};

export default function AgendamentoFormFields({
    values,
    onChange,
    onPeriodoChange,
    onVeiculoChange,
    onPacoteChange,
    onAddServico,
    onRemoveServico,
    onServicoChange,
    onServicoValorChange,
    valorTotal,
    valorFinal,
    tempoEstimadoTotal,
    errors = {},
    agendamentoId,
}: AgendamentoFormFieldsProps) {
    const [pacotes, setPacotes] = React.useState<PacoteDTO[]>([]);
    const [loadingPacotes, setLoadingPacotes] = React.useState(false);

    const [servicos, setServicos] = React.useState<ServicoSelecionavelDTO[]>([]);
    const [loadingServicos, setLoadingServicos] = React.useState(false);

    const servicosList = React.useMemo(() => values.servicos || [], [values.servicos]);
    const tipoVeiculoId = values.veiculo?.modelo?.tipo?.id;
    const pacoteId = values.pacote?.id;
    const inicioPeriodo = values.dataPrevisaoInicio ? dayjs(values.dataPrevisaoInicio) : null;
    const fimPeriodo = values.dataPrevisaoFim ? dayjs(values.dataPrevisaoFim) : null;
    const periodoInvalido = !!(inicioPeriodo && fimPeriodo && !fimPeriodo.isAfter(inicioPeriodo));

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [removeIndex, setRemoveIndex] = React.useState<number | null>(null);

    const isReadOnly = values.status === 'CANCELADO' || values.statusPagamento === 'PAGO';

    const pacotesCache = useRef<{ tipoVeiculoId?: string; pacotes: PacoteDTO[] }>({
        tipoVeiculoId: undefined,
        pacotes: [],
    });
    const servicosCache = useRef<{ tipoVeiculoId?: string; servicos: ServicoSelecionavelDTO[] }>({
        tipoVeiculoId: undefined,
        servicos: [],
    });

    // Limpa caches quando o tipo de veículo muda
    React.useEffect(() => {
        if (pacotesCache.current.tipoVeiculoId !== tipoVeiculoId) {
            pacotesCache.current = { tipoVeiculoId, pacotes: [] };
            setPacotes([]);
        }
        if (servicosCache.current.tipoVeiculoId !== tipoVeiculoId) {
            servicosCache.current = { tipoVeiculoId, servicos: [] };
            setServicos([]);
        }
    }, [tipoVeiculoId]);

    const handleAskRemoveServico = (index: number) => {
        setRemoveIndex(index);
        setConfirmOpen(true);
    };

    const handleSearchPacotes = useCallback(
        async (searchText: string = '') => {
            if (!tipoVeiculoId) {
                setPacotes([]);
                return;
            }

            const normalized = unaccent(searchText.toLowerCase());

            if (pacotesCache.current.pacotes.length === 0) {
                setLoadingPacotes(true);
                try {
                    const { data } = await searchPacotesAgendamento(tipoVeiculoId, '');
                    if (data) pacotesCache.current = { tipoVeiculoId, pacotes: data };
                } finally {
                    setLoadingPacotes(false);
                }
            }

            setPacotes(
                pacotesCache.current.pacotes.filter(p => unaccent(p.nome.toLowerCase()).includes(normalized))
            );
        },
        [tipoVeiculoId]
    );

    const handleSearchServicos = useCallback(
        async (searchText: string = '') => {
            if (!tipoVeiculoId) {
                setServicos([]);
                return;
            }

            const normalized = unaccent(searchText.toLowerCase());

            if (servicosCache.current.tipoVeiculoId !== tipoVeiculoId) {
                servicosCache.current = { tipoVeiculoId, servicos: [] };
                setServicos([]);
            }

            if (servicosCache.current.servicos.length === 0) {
                setLoadingServicos(true);
                try {
                    const [servicosInternos, servicosTerceirizados] = await Promise.all([
                        searchServicosAgendamento(tipoVeiculoId, '', pacoteId || ''),
                        searchServicosTerceirizadosAgendamento(tipoVeiculoId, '')
                    ]);

                    servicosCache.current.servicos = [
                        ...(servicosInternos.data || []).map(mapServicoInternoToSelecionavel),
                        ...(servicosTerceirizados.data || []).map(mapServicoTerceirizadoToSelecionavel),
                    ];
                } finally {
                    setLoadingServicos(false);
                }
            }

            setServicos(
                servicosCache.current.servicos.filter(s => unaccent(s.nome.toLowerCase()).includes(normalized))
            );
        },
        [tipoVeiculoId, pacoteId]
    );

    React.useEffect(() => {
        if (tipoVeiculoId) {
            handleSearchPacotes('');
        }
    }, [tipoVeiculoId, handleSearchPacotes]);

    React.useEffect(() => {
        if (tipoVeiculoId) {
            handleSearchServicos('');
        }
    }, [tipoVeiculoId, handleSearchServicos]);

    const selectedServicoIds = React.useMemo(() => {
        return new Set(
            servicosList
                .map((s) => {
                    if (s.tipoServico === 'TERCEIRIZADO') {
                        return getServicoSelecionavelKey({
                            id: s.servicoTerceirizado?.id,
                            nome: s.servicoTerceirizado?.nome || '',
                            tipoServico: 'TERCEIRIZADO',
                        });
                    }
                    return getServicoSelecionavelKey({
                        id: s.servico?.id,
                        nome: s.servico?.nome || '',
                        tipoServico: 'INTERNO',
                    });
                })
                .filter(Boolean)
        );
    }, [servicosList]);


    return (
        <>
            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader icon={<DateRangeIcon />} title="Dados do Agendamento" />
                    <Grid container spacing={3}>
                        <Grid size={2}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Número"
                                    value={values.numero || ''}
                                    disabled
                                    slotProps={{
                                        input: { readOnly: true },
                                        inputLabel: { shrink: !!values.numero },
                                    }}
                                />
                                {!values.numero && (
                                    <Tooltip title="O número será gerado automaticamente após salvar o agendamento.">
                                        <InfoOutlined
                                            sx={{
                                                ml: 0.5,
                                                fontSize: 16,
                                                color: 'text.secondary',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>

                        <Grid size={1}>
                            <StatusChip type="agendamento" status={values.status} />
                        </Grid>

                        <Grid size={3}/>

                        {values?.orcamento?.numero && (
                            <Grid size={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={values.orcamento.numero}
                                    label={
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            Número Orçamento
                                            <Tooltip title="Agendamento foi gerado a partir do Orçamento.">
                                                <InfoOutlined
                                                    sx={{
                                                        ml: 0.5,
                                                        fontSize: 16,
                                                        color: 'text.secondary',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    }
                                    disabled={true}
                                />
                            </Grid>
                        )}

                        <Grid size={8}>
                            <VeiculoAutocomplete
                                value={values.veiculo}
                                onChange={onVeiculoChange}
                                error={errors.veiculo}
                                disabled={isReadOnly || !!values.id}
                                required
                                showAddButton={!isReadOnly && !values.id}
                            />
                        </Grid>

                        <Grid size={4} />

                        <Grid size={8}>
                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                label="Observações do Agendamento"
                                value={values.observacao ?? ''}
                                onChange={(e) => onChange('observacao', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </Grid>

                        <Grid size={8}>
                            <Autocomplete
                                fullWidth
                                size="small"
                                options={pacotes}
                                getOptionLabel={(option) => option?.nome ?? ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingPacotes}
                                disabled={isReadOnly || !tipoVeiculoId}
                                value={values.pacote ?? null}
                                onChange={(_, newValue) => onPacoteChange(newValue)}
                                onInputChange={(_, newValue, reason) => {
                                    if (reason === 'input') handleSearchPacotes(newValue);
                                }}
                                onOpen={() => handleSearchPacotes('')}
                                noOptionsText="Nenhum pacote encontrado"
                                loadingText="Carregando..."
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Pacote"
                                        error={!!errors.pacote}
                                        helperText={errors.pacote || (tipoVeiculoId ? '' : 'Selecione um veículo primeiro')}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={4} />

                        {values.pacote && (
                            <>
                                <Grid size={2}>
                                    <MoneyInput
                                        fullWidth
                                        size="small"
                                        label="Valor do Pacote"
                                        required
                                        value={values.valorPacote}
                                        onChange={(val) => onChange('valorPacote', val)}
                                        disabled={isReadOnly}
                                        error={!!errors.valorPacote}
                                        helperText={errors.valorPacote}
                                    />
                                </Grid>
                                <Grid size={2}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Tempo Estimado: {formatDuration(values.pacote.tempoExecucaoMin)}
                                    </Typography>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </Card>

            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader
                        icon={<AutoAwesome />}
                        title="Serviços"
                        action={
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={onAddServico}
                                disabled={isReadOnly || !tipoVeiculoId}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                Adicionar
                            </Button>
                        }
                    />

                    {servicosList.length === 0 ? (
                        <Typography align="center" color="text.secondary" py={4} sx={{ fontStyle: 'italic' }}>
                            Nenhum serviço adicionado
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {servicosList.map((item, index) => (
                                <Card key={index} {...servicoCardStyles}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={4}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={servicos.filter((servico) => {
                                                    const optionKey = getServicoSelecionavelKey(servico);
                                                    const selectedKey = item.tipoServico === 'TERCEIRIZADO'
                                                        ? getServicoSelecionavelKey({
                                                            id: item.servicoTerceirizado?.id,
                                                            nome: item.servicoTerceirizado?.nome || '',
                                                            tipoServico: 'TERCEIRIZADO',
                                                        })
                                                        : getServicoSelecionavelKey({
                                                            id: item.servico?.id,
                                                            nome: item.servico?.nome || '',
                                                            tipoServico: 'INTERNO',
                                                        });

                                                    return !selectedServicoIds.has(optionKey) || optionKey === selectedKey;
                                                })}
                                                getOptionLabel={(option) => option?.nome ?? ''}
                                                isOptionEqualToValue={(option, value) => getServicoSelecionavelKey(option) === getServicoSelecionavelKey(value)}
                                                loading={loadingServicos}
                                                value={item.tipoServico === 'TERCEIRIZADO'
                                                    ? (item.servicoTerceirizado ? mapServicoTerceirizadoToSelecionavel(item.servicoTerceirizado) : null)
                                                    : (item.servico ? mapServicoInternoToSelecionavel(item.servico) : null)}
                                                onChange={(_, newValue) => onServicoChange(index, newValue)}
                                                onInputChange={(_, newValue, reason) => {
                                                    if (reason === 'input') handleSearchServicos(newValue);
                                                }}
                                                onOpen={() => handleSearchServicos('')}
                                                noOptionsText="Nenhum serviço encontrado"
                                                loadingText="Carregando..."
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <span>{option.nome}</span>
                                                            {option.tipoServico === 'TERCEIRIZADO' && (
                                                                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                                                                    Terceirizado
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Serviço" required />
                                                )}
                                                disabled={isReadOnly}
                                            />
                                        </Grid>

                                        <Grid size={2}>
                                            <MoneyInput
                                                fullWidth
                                                size="small"
                                                label="Valor"
                                                required
                                                value={item.valor}
                                                onChange={(val) => onServicoValorChange(index, val)}
                                                disabled={isReadOnly || (!item.servico && !item.servicoTerceirizado)}
                                                error={!!errors[`servico_${index}`]}
                                                helperText={errors[`servico_${index}`]}
                                            />
                                        </Grid>

                                        <Grid size={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                Tempo Estimado: {item.tempoExecucaoMin ? formatDuration(item.tempoExecucaoMin) : '-'}
                                            </Typography>
                                            {item.tipoServico === 'TERCEIRIZADO' && (
                                                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                                                    Serviço terceirizado
                                                </Typography>
                                            )}
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
                                                disabled={isReadOnly}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Card>

            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader icon={<TimeIcon />} title="Período" />
                    <Grid container spacing={3}>
                        <Grid size={4}>
                            <DateTimeRangeField
                                label="Data"
                                required
                                fullWidth
                                value={{
                                    start: values.dataPrevisaoInicio ? dayjs(values.dataPrevisaoInicio) : null,
                                    end: values.dataPrevisaoFim ? dayjs(values.dataPrevisaoFim) : null,
                                }}
                                onChange={(range) => {
                                    const inicio = range.start?.format('YYYY-MM-DDTHH:mm:ss') ?? null;
                                    const fim = range.end?.format('YYYY-MM-DDTHH:mm:ss') ?? null;
                                    if (onPeriodoChange) {
                                        onPeriodoChange(inicio, fim);
                                        return;
                                    }
                                    onChange('dataPrevisaoInicio', inicio);
                                    onChange('dataPrevisaoFim', fim);
                                }}
                                disabled={isReadOnly}
                                error={periodoInvalido || !!errors.dataPrevisaoInicio || !!errors.dataPrevisaoFim}
                                helperText={
                                    periodoInvalido
                                        ? 'A data/hora fim deve ser maior que a data/hora início'
                                        : (errors.dataPrevisaoInicio || errors.dataPrevisaoFim)
                                }
                                defaultDurationMinutes={tempoEstimadoTotal > 0 ? tempoEstimadoTotal : 60}
                            />
                        </Grid>

                        {(!isReadOnly) && (
                            <>
                                <Grid size={6}/>

                                <Grid size={6}>
                                    <DayAvailabilityTimeline
                                        selectedDate={values.dataPrevisaoInicio}
                                        excludeAgendamentoId={agendamentoId}
                                        onTimeSelect={(time) => onChange('dataPrevisaoInicio', time)}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </Card>

            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader icon={<AttachMoneyIcon />} title="Valor" />
                    <Grid container spacing={3}>
                        <Grid size={2}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Valor Total"
                                value={formatCurrency(valorTotal)}
                                disabled
                            />
                        </Grid>

                        <Grid size={2}>
                            <MoneyInput
                                fullWidth
                                size="small"
                                label="Desconto"
                                value={values.valorDesconto}
                                onChange={(val) => {
                                    const descontoValido = Math.min(Math.max(val, 0), valorTotal);
                                    onChange('valorDesconto', descontoValido);
                                }}
                                error={!!errors.valorDesconto}
                                disabled={isReadOnly}
                                helperText={errors.valorDesconto}
                            />
                        </Grid>

                        <Grid size={2}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Valor Final"
                                value={formatCurrency(valorFinal ?? 0)}
                                sx={{
                                    '& .MuiInputBase-input': {
                                        fontWeight: 'bold',
                                        color: 'success.main',
                                    },
                                }}
                                disabled
                                error={!!errors.valorFinal}
                                helperText={errors.valorFinal}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            <ConfirmDeleteDialog
                open={confirmOpen}
                payload={{
                    itemName:
                        servicosList[removeIndex ?? 0]?.servico?.nome
                        ?? servicosList[removeIndex ?? 0]?.servicoTerceirizado?.nome
                        ?? '',
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
