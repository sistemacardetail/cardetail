import React from 'react';
import dayjs from 'dayjs';
import {
    AccessTime,
    FilterAlt,
    Groups,
    PersonSearch,
    Repeat,
    Today,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    Grid,
    LinearProgress,
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
import { formatDate } from '../utils';
import { useNotifications } from '../hooks/useNotifications';
import { ConsultaClienteItem, consultarClientes } from './ConsultaService';

interface FiltrosClientes {
    dataInicio: string;
    dataFim: string;
    clienteNome: string;
    incluirCancelados: boolean;
}

const formatFrequencia = (item: ConsultaClienteItem): string => {
    if (item.mediaDiasEntreVisitas === null) {
        return 'Sem histórico suficiente';
    }

    return `${item.mediaDiasEntreVisitas} dias`;
};

export default function ConsultaClientes() {
    const notifications = useNotifications();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [filtros, setFiltros] = React.useState<FiltrosClientes>({
        dataInicio: dayjs().subtract(12, 'month').startOf('month').format('YYYY-MM-DD'),
        dataFim: dayjs().format('YYYY-MM-DD'),
        clienteNome: '',
        incluirCancelados: false,
    });
    const [itens, setItens] = React.useState<ConsultaClienteItem[]>([]);

    const carregarDados = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: requestError } = await consultarClientes({
            dataInicio: filtros.dataInicio,
            dataFim: filtros.dataFim,
            clienteNome: filtros.clienteNome,
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

    const totalClientes = itens.length;
    const mediaDias = itens.length > 0
        ? itens
            .filter((item) => item.mediaDiasEntreVisitas !== null)
            .reduce((acc, item) => acc + (item.mediaDiasEntreVisitas || 0), 0)
            / Math.max(1, itens.filter((item) => item.mediaDiasEntreVisitas !== null).length)
        : 0;
    const clientesSemRetorno = itens.filter((item) => (item.diasDesdeUltimaVisita || 0) >= 30).length;
    const maxAgendamentos = Math.max(...itens.map((item) => item.totalAgendamentos), 1);

    return (
        <PageContainer
            title="Consulta de Clientes"
            description="Análise de retenção, recência de visita e frequência de agendamentos."
            icon={<Groups />}
        >
            <Card
                variant="outlined"
                sx={{
                    mb: 2,
                    borderRadius: 3,
                    background: (theme) => `linear-gradient(140deg, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.08)})`,
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
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Cliente"
                                value={filtros.clienteNome}
                                onChange={(event) => setFiltros((prev) => ({ ...prev, clienteNome: event.target.value }))}
                                placeholder="Buscar por nome"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button variant="contained" fullWidth onClick={carregarDados} disabled={loading}>
                                Atualizar
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={filtros.incluirCancelados}
                                        onChange={(event) => setFiltros((prev) => ({
                                            ...prev,
                                            incluirCancelados: event.target.checked,
                                        }))}
                                    />
                                )}
                                label="Incluir agendamentos cancelados"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Clientes no período</Typography>
                                <Groups color="primary" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalClientes}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Média entre visitas</Typography>
                                <Repeat color="info" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{mediaDias.toFixed(1)} dias</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Sem retorno (30+ dias)</Typography>
                                <AccessTime color="warning" fontSize="small" />
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{clientesSemRetorno}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <PersonSearch color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Análise de clientes</Typography>
                        <Chip icon={<FilterAlt fontSize="small" />} label={`${itens.length} resultados`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                    </Stack>

                    {loading ? (
                        <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : (
                        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>Último agendamento</TableCell>
                                        <TableCell>Dias sem visita</TableCell>
                                        <TableCell align="center">Agendamentos</TableCell>
                                        <TableCell>Frequência média</TableCell>
                                        <TableCell>Intensidade</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {itens.map((item) => {
                                        const progress = (item.totalAgendamentos / maxAgendamentos) * 100;
                                        const recencia = item.diasDesdeUltimaVisita || 0;

                                        return (
                                            <TableRow key={item.clienteNome} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.clienteNome}</TableCell>
                                                <TableCell>{formatDate(item.ultimoAgendamento)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={`${recencia} dias`}
                                                        color={recencia >= 30 ? 'warning' : 'success'}
                                                        variant="outlined"
                                                        icon={<Today fontSize="small" />}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{item.totalAgendamentos}</TableCell>
                                                <TableCell>{formatFrequencia(item)} ({item.frequenciaMensal}/mês)</TableCell>
                                                <TableCell sx={{ minWidth: 150 }}>
                                                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 8 }} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {itens.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                                    Nenhum cliente encontrado para os filtros informados.
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
        </PageContainer>
    );
}
