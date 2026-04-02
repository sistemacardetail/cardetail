import React from 'react';
import dayjs from 'dayjs';
import { DirectionsCar, Repeat, Search, } from '@mui/icons-material';
import {
    Alert,
    alpha,
    Box,
    Card,
    Chip,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import PageContainer from '../components/PageContainer';
import { formatDate } from '../utils';
import { useNotifications } from '../hooks/useNotifications';
import { consultarVeiculos, ConsultaVeiculoItem } from './ConsultaService';
import ConsultaFilters, { DatePreset } from './ConsultaFilters';

interface FiltrosVeiculos {
    dataInicio: string;
    dataFim: string;
    busca: string;
    incluirCancelados: boolean;
}

const datePresets: DatePreset[] = [
    {
        label: 'Último mês',
        getRange: () => ({
            dataInicio: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
    {
        label: '3 meses',
        getRange: () => ({
            dataInicio: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
    {
        label: '6 meses',
        getRange: () => ({
            dataInicio: dayjs().subtract(6, 'month').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
    {
        label: '12 meses',
        getRange: () => ({
            dataInicio: dayjs().subtract(12, 'month').format('YYYY-MM-DD'),
            dataFim: dayjs().format('YYYY-MM-DD'),
        }),
    },
];

const formatFrequencia = (item: ConsultaVeiculoItem): string => {
    if (item.mediaDiasEntreVisitas === null) {
        return '-';
    }
    return `${item.mediaDiasEntreVisitas} dias`;
};

export default function ConsultaClientes() {
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [filtros, setFiltros] = React.useState<FiltrosVeiculos>({
        dataInicio: dayjs().subtract(12, 'month').format('YYYY-MM-DD'),
        dataFim: dayjs().format('YYYY-MM-DD'),
        busca: '',
        incluirCancelados: false,
    });
    const [itens, setItens] = React.useState<ConsultaVeiculoItem[]>([]);

    const carregarDados = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: requestError } = await consultarVeiculos({
            dataInicio: filtros.dataInicio,
            dataFim: filtros.dataFim,
            busca: filtros.busca,
            incluirCancelados: filtros.incluirCancelados,
        });

        if (requestError) {
            setError(requestError);
            notifications.show({ message: requestError, severity: 'error' });
            setLoading(false);
            return;
        }

        setItens(data || []);
        setLoading(false);
    }, [filtros, notifications]);

    React.useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    return (
        <PageContainer
            title="Consulta de Clientes"
            description="Análise de frequência de visitas e histórico de agendamentos."
            icon={<DirectionsCar />}
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
                <TextField
                    size="small"
                    label="Buscar"
                    placeholder="Cliente, placa ou modelo"
                    value={filtros.busca}
                    onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && carregarDados()}
                    slotProps={{
                        input: {
                            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />,
                        },
                    }}
                    sx={{ minWidth: 240, flex: 1 }}
                />
            </ConsultaFilters>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
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
                                Agendamentos por cliente
                            </Typography>
                        </Stack>
                        <Chip
                            label={`${itens.length} resultados`}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 2, fontWeight: 500 }}
                        />
                    </Stack>
                </Box>

                {loading ? (
                    <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 540 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Cliente / Veículo
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Último agendamento
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Dias sem agendamento
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Agendamentos
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        Frequência média
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itens.map((item) => {
                                    return (
                                        <TableRow
                                            key={item.veiculoId}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {item.clienteNome}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="caption">
                                                            {item.marca} {item.modelo} {item.cor} • {item.placa}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {item.ultimoAgendamento ? formatDate(item.ultimoAgendamento) : '-'}
                                            </Typography>
                                        </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={600}>
                                                    {item.diasDesdeUltimaVisita}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={600}>
                                                    {item.totalAgendamentos}
                                                </Typography>
                                            </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                                <Repeat sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {formatFrequencia(item)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {itens.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Box sx={{ py: 6, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Nenhum cliente encontrado para os filtros informados.
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
        </PageContainer>
    );
}
