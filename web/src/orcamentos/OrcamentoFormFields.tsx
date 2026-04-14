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
import { AutoAwesome, InfoOutlined } from '@mui/icons-material';
import { OrcamentoDTO } from './OrcamentoService';
import { VeiculoDTO } from '../clientes/ClienteService';
import { PacoteDTO, searchPacotesAgendamento } from '../pacotes';
import {
    getServicoSelecionavelKey,
    mapServicoInternoToSelecionavel,
    mapServicoTerceirizadoToSelecionavel,
    searchServicosAgendamento,
    ServicoSelecionavelDTO
} from '../servicos';
import { formatCurrency, formatDuration } from '../utils';
import MoneyInput from '../components/MoneyInput';
import SectionHeader from '../components/SectionHeader';
import ClienteAutocomplete, { ClienteAutocompleteDTO } from '../components/ClienteAutocomplete';
import VeiculoAutocomplete from '../components/VeiculoAutocomplete';
import StatusChip from '../components/StatusChip';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { unaccent } from '../utils/string.utils';
import { searchServicosTerceirizadosAgendamento } from '../servicos-terceirizados';

export interface OrcamentoFormFieldsProps {
    values: Partial<OrcamentoDTO>;
    onChange: (field: keyof OrcamentoDTO, value: any) => void;
    cliente: ClienteAutocompleteDTO | null;
    onClienteChange: (cliente: ClienteAutocompleteDTO | null) => void;
    onVeiculoChange: (veiculo: VeiculoDTO | null, clienteData?: ClienteAutocompleteDTO) => void;
    onPacoteChange: (pacote: PacoteDTO | null) => void;
    onAddServico: () => void;
    onRemoveServico: (index: number) => void;
    onServicoChange: (index: number, servico: ServicoSelecionavelDTO | null) => void;
    onServicoValorChange: (index: number, valor: number) => void;
    valorTotal: number;
    valorFinal: number;
    tempoEstimadoTotal: number;
    errors?: Record<string, string>;
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

export default function OrcamentoFormFields({
    values,
    onChange,
    cliente,
    onClienteChange,
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
}: OrcamentoFormFieldsProps) {
    const [pacotes, setPacotes] = React.useState<PacoteDTO[]>([]);
    const [loadingPacotes, setLoadingPacotes] = React.useState(false);

    const [servicos, setServicos] = React.useState<ServicoSelecionavelDTO[]>([]);
    const [loadingServicos, setLoadingServicos] = React.useState(false);

    const servicosList = React.useMemo(() => values.servicos || [], [values.servicos]);
    const tipoVeiculoId = values.veiculo?.modelo?.tipo?.id;
    const pacoteId = values.pacote?.id;
    const isReadOnly = values.status === 'AGENDADO' || values.status === 'CANCELADO';

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [removeIndex, setRemoveIndex] = React.useState<number | null>(null);

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
        handleSearchPacotes('');
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

    const tempoInseridoManualmente = useRef(false);

    React.useEffect(() => {
        if (!tempoInseridoManualmente.current && tempoEstimadoTotal) {
            onChange("tempoExecucaoMin", tempoEstimadoTotal);
        }
    }, [tempoEstimadoTotal, onChange]);

    return (
        <>
            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader icon={<AttachMoneyIcon />} title="Dados do Orçamento" />
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
                                    <Tooltip title="O número será gerado automaticamente após salvar o orçamento.">
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

                        <Grid size={1} justifyContent="flex-end">
                            <StatusChip type="orcamento" status={values.status} />
                        </Grid>

                        <Grid size={8} />

                        <Grid size={4}>
                            <ClienteAutocomplete
                                value={cliente}
                                onChange={onClienteChange}
                                error={errors.cliente}
                                disabled={isReadOnly || !!values.id}
                                required
                                showAddButton={!isReadOnly && !values.id}
                            />
                        </Grid>

                        <Grid size={4}>
                            <VeiculoAutocomplete
                                value={values.veiculo}
                                clienteId={cliente?.id}
                                onChange={onVeiculoChange}
                                error={errors.veiculo}
                                disabled={isReadOnly || !!values.id}
                                required
                            />
                        </Grid>

                        <Grid size={8}>
                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                label="Observações do Orçamento"
                                value={values.observacao ?? ''}
                                onChange={(e) => onChange('observacao', e.target.value)}
                                disabled={isReadOnly}
                            />
                        </Grid>

                        <Grid size={8}>
                            <Autocomplete
                                fullWidth
                                size="small"
                                disabled={isReadOnly}
                                options={pacotes}
                                getOptionLabel={(option) => option?.nome ?? ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                loading={loadingPacotes}
                                value={values.pacote ?? null}
                                onChange={(_, newValue) => onPacoteChange(newValue)}
                                onInputChange={(_, newValue, reason) => {
                                    if (reason === 'input') {
                                        handleSearchPacotes(newValue);
                                    }
                                }}
                                onOpen={() => handleSearchPacotes('')}
                                noOptionsText="Nenhum pacote encontrado"
                                loadingText="Carregando..."
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Pacote"
                                        error={!!errors.pacote}
                                        helperText={errors.pacote}
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
                                        Tempo estimado: {formatDuration(values.pacote.tempoExecucaoMin)}
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
                                <Card key={index} variant="outlined" sx={{ p: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={4}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                disabled={isReadOnly}
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
                                                    if (reason === 'input') {
                                                        handleSearchServicos(newValue);
                                                    }
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
                                                    <TextField
                                                        {...params}
                                                        label="Serviço"
                                                        required
                                                    />
                                                )}
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
                                                Tempo estimado: {item.tempoExecucaoMin ? formatDuration(item.tempoExecucaoMin) : '-'}
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

                        {/* Desconto */}
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
                                disabled={isReadOnly}
                                error={!!errors.valorDesconto}
                                helperText={errors.valorDesconto}
                            />
                        </Grid>

                        {/* Valor Final (somente leitura) */}
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
                                error={!!errors.valorFinal}
                                helperText={errors.valorFinal}
                                disabled
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
