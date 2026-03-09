import React from 'react';
import dayjs from 'dayjs';
import {
    Assessment,
    CalendarMonth,
    MonetizationOn,
    Payments,
    QueryStats,
    ReceiptLong,
    TrendingUp,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import PageContainer from '../components/PageContainer';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency, formatDate, getStatusPagamentoLabel } from '../utils';
import { ConsultaFinanceiroItem, consultarFaturamento } from './ConsultaService';

interface FiltrosFaturamento {
    dataInicio: string;
    dataFim: string;
    statusPagamento: 'TODOS' | 'PAGO' | 'PARCIAL' | 'PENDENTE';
}

const STATUS_OPTIONS: Array<FiltrosFaturamento['statusPagamento']> = ['TODOS', 'PAGO', 'PARCIAL', 'PENDENTE'];

const getStatusColor = (status: ConsultaFinanceiroItem['statusPagamento']) => {
    if (status === 'PAGO') return 'success';
    if (status === 'PARCIAL') return 'info';
    return 'warning';
};

const periodPresets = [
    { label: 'Mês atual', days: 0, useMonth: true },
    { label: '30 dias', days: 30, useMonth: false },
    { label: '90 dias', days: 90, useMonth: false },
    { label: 'Ano atual', days: 0, useMonth: false, useYear: true },
] as const;

export default function ConsultaFaturamento() {
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [filtros, setFiltros] = React.useState<FiltrosFaturamento>({
        dataInicio: dayjs().startOf('month').format('YYYY-MM-DD'),
        dataFim: dayjs().endOf('month').format('YYYY-MM-DD'),
        statusPagamento: 'TODOS',
    });

    const [itens, setItens] = React.useState<ConsultaFinanceiroItem[]>([]);
    const [resumo, setResumo] = React.useState({
        valorRecebido: 0,
        valorPendente: 0,
        valorTotal: 0,
        faturamentoAnual: 0,
    });
    const [serieMensal, setSerieMensal] = React.useState<Array<{ mes: string; recebido: number; pendente: number; total: number }>>([]);

    const carregarDados = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: requestError } = await consultarFaturamento({
            dataInicio: filtros.dataInicio,
            dataFim: filtros.dataFim,
            statusPagamento: filtros.statusPagamento,
            incluirCancelados: false,
        });

        if (requestError) {
            setError(requestError);
            notifications.show({ message: requestError, severity: 'error' });
            setLoading(false);
            return;
        }

        setItens(data?.itens || []);
        setResumo({
            valorRecebido: data?.valorRecebido || 0,
            valorPendente: data?.valorPendente || 0,
            valorTotal: data?.valorTotal || 0,
            faturamentoAnual: data?.faturamentoAnual || 0,
        });
        setSerieMensal(data?.serieMensal || []);
        setLoading(false);
    }, [filtros, notifications]);

    React.useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const percentualRecebido = resumo.valorTotal > 0 ? (resumo.valorRecebido / resumo.valorTotal) * 100 : 0;
    const maiorValorMensal = Math.max(...serieMensal.map((item) => item.total), 1);

    const handlePreset = (preset: (typeof periodPresets)[number]) => {
        if (preset.useMonth) {
            setFiltros((prev) => ({
                ...prev,
                dataInicio: dayjs().startOf('month').format('YYYY-MM-DD'),
                dataFim: dayjs().endOf('month').format('YYYY-MM-DD'),
            }));
            return;
        }

        if (preset.useYear) {
            setFiltros((prev) => ({
                ...prev,
                dataInicio: dayjs().startOf('year').format('YYYY-MM-DD'),
                dataFim: dayjs().endOf('year').format('YYYY-MM-DD'),
            }));
            return;
        }

        setFiltros((prev) => ({
            ...prev,
            dataInicio: dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }));
    };

    return (
        <PageContainer
            title="Faturamento"
            description="Painel financeiro com indicadores, visão mensal e lançamentos por período."
            icon={<Assessment />}
        >
            <Card
                variant="outlined"
                sx={{
                    mb: 2,
                    borderRadius: 3,
                    background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.success.main, 0.08)})`,
                }}
            >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Data inicial"
                                type="date"
                                value={filtros.dataInicio}
                                onChange={(event) => setFiltros((prev) => ({ ...prev, dataInicio: event.target.value }))}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Data final"
                                type="date"
                                value={filtros.dataFim}
                                onChange={(event) => setFiltros((prev) => ({ ...prev, dataFim: event.target.value }))}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status pagamento</InputLabel>
                                <Select
                                    label="Status pagamento"
                                    value={filtros.statusPagamento}
                                    onChange={(event) => setFiltros((prev) => ({
                                        ...prev,
                                        statusPagamento: event.target.value as FiltrosFaturamento['statusPagamento'],
                                    }))}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status === 'TODOS' ? 'Todos' : getStatusPagamentoLabel(status)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button onClick={carregarDados} variant="contained" fullWidth disabled={loading}>
                                Atualizar painel
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                                {periodPresets.map((preset) => (
                                    <Chip
                                        key={preset.label}
                                        icon={<CalendarMonth fontSize="small" />}
                                        label={preset.label}
                                        onClick={() => handlePreset(preset)}
                                        variant="outlined"
                                        clickable
                                    />
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography color="text.secondary" variant="body2">Recebido</Typography>
                                <Payments color="success" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(resumo.valorRecebido)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography color="text.secondary" variant="body2">Pendente</Typography>
                                <ReceiptLong color="warning" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(resumo.valorPendente)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography color="text.secondary" variant="body2">Total no período</Typography>
                                <MonetizationOn color="primary" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(resumo.valorTotal)}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {percentualRecebido.toFixed(1)}% já recebido
                                </Typography>
                                <LinearProgress variant="determinate" value={percentualRecebido} sx={{ mt: 0.75, height: 7, borderRadius: 8 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography color="text.secondary" variant="body2">Faturamento anual</Typography>
                                <TrendingUp color="info" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(resumo.faturamentoAnual)}</Typography>
                            <Typography variant="caption" color="text.secondary">Valores recebidos no ano corrente</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <QueryStats color="primary" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Desempenho mensal
                                </Typography>
                            </Stack>
                            {serieMensal.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Sem dados financeiros para o período selecionado.
                                </Typography>
                            )}
                            <Stack spacing={1.5}>
                                {serieMensal.map((item) => {
                                    const ratio = (item.total / maiorValorMensal) * 100;
                                    const recebidoRatio = item.total > 0 ? (item.recebido / item.total) * 100 : 0;

                                    return (
                                        <Box key={item.mes}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(item.mes).format('MM/YYYY')}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                    {formatCurrency(item.total)}
                                                </Typography>
                                            </Stack>
                                            <Box sx={{ width: `${Math.max(ratio, 8)}%`, bgcolor: 'grey.200', borderRadius: 2, height: 10, overflow: 'hidden' }}>
                                                <Box sx={{ width: `${recebidoRatio}%`, bgcolor: 'success.main', height: '100%' }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                <ReceiptLong color="primary" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Lançamentos financeiros
                                </Typography>
                                <Chip label={`${itens.length} registros`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                            </Stack>

                            {loading ? (
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={30} />
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 460, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Número</TableCell>
                                                <TableCell>Cliente</TableCell>
                                                <TableCell>Data</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="right">Recebido</TableCell>
                                                <TableCell align="right">Pendente</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itens.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>#{item.numero}</TableCell>
                                                    <TableCell>{item.clienteNome}</TableCell>
                                                    <TableCell>{formatDate(item.dataPrevisaoInicio)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={getStatusPagamentoLabel(item.statusPagamento)}
                                                            color={getStatusColor(item.statusPagamento)}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(item.valorRecebido)}</TableCell>
                                                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(item.valorPendente)}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(item.valorTotal)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {itens.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={7}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                                            Nenhum lançamento encontrado para os filtros aplicados.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </PageContainer>
    );
}
