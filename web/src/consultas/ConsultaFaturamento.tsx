import React from 'react';
import dayjs from 'dayjs';
import { MonetizationOn, Payments, ReceiptLong, } from '@mui/icons-material';
import {
    Alert,
    alpha,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import PageContainer from '../components/PageContainer';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency, formatDate, getStatusPagamentoLabel } from '../utils';
import { ConsultaFinanceiroItem, consultarFaturamento } from './ConsultaService';
import ConsultaFilters, { DatePreset, StatusSelect } from './ConsultaFilters';

interface FiltrosFaturamento {
    dataInicio: string;
    dataFim: string;
    statusPagamento: 'TODOS' | 'PAGO' | 'PARCIAL' | 'PENDENTE';
}

const STATUS_OPTIONS: Array<{ value: FiltrosFaturamento['statusPagamento']; label: string }> = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'PARCIAL', label: 'Parcial' },
    { value: 'PENDENTE', label: 'Pendente' },
];

const datePresets: DatePreset[] = [
    {
        label: 'Mês atual',
        getRange: () => ({
            dataInicio: dayjs().startOf('month').format('YYYY-MM-DD'),
            dataFim: dayjs().endOf('month').format('YYYY-MM-DD'),
        }),
    },
    {
        label: '30 dias',
        getRange: () => ({
            dataInicio: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
    {
        label: '90 dias',
        getRange: () => ({
            dataInicio: dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
    {
        label: 'Ano atual',
        getRange: () => ({
            dataInicio: dayjs().startOf('year').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
];

const getStatusColor = (status: ConsultaFinanceiroItem['statusPagamento']) => {
    if (status === 'PAGO') return 'success';
    if (status === 'PARCIAL') return 'info';
    return 'warning';
};

const getVeiculoLabel = (item: ConsultaFinanceiroItem) => {
    const modeloPartes = [item.veiculoMarca, item.veiculoModelo].filter(Boolean);
    const modelo = modeloPartes.join(' ');
    const placa = item.veiculoSemPlaca ? 'Sem placa' : item.veiculoPlaca || '';
    const detalhes = [modelo, placa].filter(Boolean);
    return detalhes.length > 0 ? detalhes.join(' • ') : '-';
};

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
        setLoading(false);
    }, [filtros, notifications]);

    React.useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const percentualRecebido = resumo.valorTotal > 0 ? (resumo.valorRecebido / resumo.valorTotal) * 100 : 0;

    return (
        <PageContainer
            title="Faturamento"
            description="Painel financeiro com indicadores, visão mensal e lançamentos por período."
            icon={<ReceiptLong />}
        >
            <ConsultaFilters
                dataInicio={filtros.dataInicio}
                dataFim={filtros.dataFim}
                onDataInicioChange={(value) => setFiltros((prev) => ({ ...prev, dataInicio: value }))}
                onDataFimChange={(value) => setFiltros((prev) => ({ ...prev, dataFim: value }))}
                onSearch={carregarDados}
                isLoading={loading}
                datePresets={datePresets}
            >
                <StatusSelect
                    value={filtros.statusPagamento}
                    onChange={(value) => setFiltros((prev) => ({ ...prev, statusPagamento: value }))}
                    options={STATUS_OPTIONS}
                    label="Status pagamento"
                />
            </ConsultaFilters>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 6, lg: 4 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'success.main' },
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Recebido
                                </Typography>
                                <Payments color="success" sx={{ fontSize: 18 }} />
                            </Stack>
                            <Typography variant="h6" fontWeight={700}>{formatCurrency(resumo.valorRecebido)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, lg: 4 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'warning.main' },
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Pendente
                                </Typography>
                                <ReceiptLong color="warning" sx={{ fontSize: 18 }} />
                            </Stack>
                            <Typography variant="h6" fontWeight={700}>{formatCurrency(resumo.valorPendente)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, lg: 4 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'primary.main' },
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Total no período
                                </Typography>
                                <MonetizationOn color="primary" sx={{ fontSize: 18 }} />
                            </Stack>
                            <Typography variant="h6" fontWeight={700}>{formatCurrency(resumo.valorTotal)}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {percentualRecebido.toFixed(1)}% recebido
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentualRecebido}
                                    sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 12 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                px: 2.5,
                                py: 2,
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Lançamentos financeiros
                                    </Typography>
                                </Stack>
                                <Chip
                                    label={`${itens.length} registros`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: 2, fontWeight: 500 }}
                                />
                            </Stack>
                        </Box>

                        {loading ? (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : (
                            <TableContainer sx={{ maxHeight: 400, flex: 1 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Nº Agendamento
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Cliente / Veículo
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Data
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Status
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Recebido
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Pendente
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {itens.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                                                    },
                                                }}
                                            >
                                                <TableCell align="center">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        #{item.numero}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.25}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {item.clienteNome}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {getVeiculoLabel(item)}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">{formatDate(item.dataPrevisaoInicio)}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={getStatusPagamentoLabel(item.statusPagamento)}
                                                        color={getStatusColor(item.statusPagamento)}
                                                        variant="outlined"
                                                        sx={{ borderRadius: 2, fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {formatCurrency(item.valorRecebido)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {formatCurrency(item.valorPendente)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                                                        {formatCurrency(item.valorTotal)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {itens.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Box sx={{ py: 6, textAlign: 'center' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Nenhum lançamento encontrado para os filtros aplicados.
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </PageContainer>
    );
}
