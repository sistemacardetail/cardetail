import React from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
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
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import SectionHeader from '../components/SectionHeader';
import MoneyInput from '../components/MoneyInput';
import { formatCurrency } from '../utils';
import { useNotifications } from '../hooks/useNotifications';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import {
    adicionarPagamento,
    AgendamentoPagamentoDTO,
    AgendamentoResumoFinanceiroDTO,
    FormaPagamento,
    FORMAS_PAGAMENTO,
    getResumoFinanceiro,
    removerPagamento,
} from './AgendamentoPagamentoService';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';
import { CurrencyExchange } from '@mui/icons-material';

interface AgendamentoPagamentosProps {
    agendamentoId?: string;
    valorTotal?: number;
    valorTotalAgendamento?: number;
    pagamentosLocais?: AgendamentoPagamentoDTO[];
    onPagamentosChange?: (pagamentos: AgendamentoPagamentoDTO[]) => void;
    onPagamentoChange?: (statusPagamento?: string, valorPagoTotal?: number) => void;
    statusAgendamento?: string;
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

interface NovoPagamentoForm {
    valorPago: number;
    dataRecebimento: Dayjs | null;
    formaPagamento: FormaPagamento | '';
    observacao: string;
}

const initialForm: NovoPagamentoForm = {
    valorPago: 0,
    dataRecebimento: dayjs(),
    formaPagamento: '',
    observacao: '',
};

export default function AgendamentoPagamentos({
    agendamentoId,
    valorTotal = 0,
    valorTotalAgendamento,
    pagamentosLocais,
    onPagamentosChange,
    onPagamentoChange,
    statusAgendamento,
}: AgendamentoPagamentosProps) {
    const notifications = useNotifications();
    const { hasPermissao } = useAuth();

    const podeCriarPagamento = hasPermissao(PERMISSOES.AGENDAMENTOS_PAGAMENTOS_CRIAR);
    const podeExcluirPagamento = hasPermissao(PERMISSOES.AGENDAMENTOS_PAGAMENTOS_EXCLUIR);
    const [loading, setLoading] = React.useState(false);
    const [resumo, setResumo] = React.useState<AgendamentoResumoFinanceiroDTO | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [form, setForm] = React.useState<NovoPagamentoForm>(initialForm);
    const [submitting, setSubmitting] = React.useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const [pagamentoToDelete, setPagamentoToDelete] = React.useState<AgendamentoPagamentoDTO | null>(null);
    const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);

    const isLocalMode = !agendamentoId;
    const pagamentos = isLocalMode ? (pagamentosLocais || []) : (resumo?.pagamentos || []);

    const valorPagoTotal = pagamentos.reduce((acc, p) => acc + (p.valorPago || 0), 0);
    const displayValorTotal = valorTotalAgendamento ?? (isLocalMode ? valorTotal : (resumo?.valorTotal ?? 0));
    const displaySaldoRestante = displayValorTotal - valorPagoTotal;

    const isPago = displaySaldoRestante <= 0 && valorPagoTotal > 0;
    const isCancelado = statusAgendamento === 'CANCELADO';
    const podeReceberPagamento = displaySaldoRestante > 0 && !isCancelado;

    const carregarResumo = React.useCallback(async () => {
        if (!agendamentoId) return;

        setLoading(true);
        const { data, error } = await getResumoFinanceiro(agendamentoId);

        if (error) {
            notifications.show({ message: error, severity: 'error' });
        } else if (data) {
            setResumo(data);
        }
        setLoading(false);
    }, [agendamentoId, notifications]);

    React.useEffect(() => {
        if (agendamentoId) {
            carregarResumo();
        }
    }, [agendamentoId, carregarResumo]);

    const handleOpenDialog = () => {
        setForm({
            ...initialForm,
            valorPago: displaySaldoRestante > 0 ? displaySaldoRestante : 0,
        });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setForm(initialForm);
    };

    const isDataFutura = form.dataRecebimento?.isAfter(dayjs(), 'day') ?? false;
    const isValorExcedido = form.valorPago > displaySaldoRestante;
    const hasValidationErrors = isValorExcedido || isDataFutura;

    const handleSubmit = async () => {
        if (!form.valorPago || form.valorPago <= 0) {
            notifications.show({ message: 'Informe o valor do pagamento', severity: 'error' });
            return;
        }
        if (!form.dataRecebimento) {
            notifications.show({ message: 'Informe a data de recebimento', severity: 'error' });
            return;
        }
        if (isDataFutura) {
            notifications.show({ message: 'A data de recebimento não pode ser futura', severity: 'error' });
            return;
        }
        if (!form.formaPagamento) {
            notifications.show({ message: 'Selecione a forma de pagamento', severity: 'error' });
            return;
        }
        if (isValorExcedido) {
            notifications.show({ message: `O valor não pode exceder o saldo restante (${formatCurrency(displaySaldoRestante)})`, severity: 'error' });
            return;
        }

        if (isLocalMode) {
            const novoPagamento: AgendamentoPagamentoDTO = {
                id: `local-${Date.now()}`,
                valorPago: form.valorPago,
                dataRecebimento: form.dataRecebimento.format('YYYY-MM-DD'),
                formaPagamento: form.formaPagamento as FormaPagamento,
                formaPagamentoDescricao: FORMAS_PAGAMENTO.find(f => f.value === form.formaPagamento)?.label,
                observacao: form.observacao || undefined,
            };
            onPagamentosChange?.([...pagamentos, novoPagamento]);
            notifications.show({ message: 'Pagamento adicionado', severity: 'success' });
            handleCloseDialog();
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                valorPago: form.valorPago,
                dataRecebimento: form.dataRecebimento.format('YYYY-MM-DD'),
                formaPagamento: form.formaPagamento as FormaPagamento,
                observacao: form.observacao || undefined,
            };

            const result = await adicionarPagamento(agendamentoId!, payload);

            if (result.error) {
                notifications.show({ message: result.error, severity: 'error' });
                return;
            }

            setDialogOpen(false);
            setForm(initialForm);

            notifications.show({ message: 'Pagamento registrado e agendamento atualizado!', severity: 'success' });

            const { data: novoResumo } = await getResumoFinanceiro(agendamentoId!);
            if (novoResumo) {
                setResumo(novoResumo);
                onPagamentoChange?.(novoResumo.statusPagamento, novoResumo.valorPagoTotal);
            }
        } catch (err) {
            console.error('Erro ao adicionar pagamento:', err);
            notifications.show({ message: 'Erro inesperado ao adicionar pagamento', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (pagamento: AgendamentoPagamentoDTO, index: number) => {
        setPagamentoToDelete(pagamento);
        setDeleteIndex(index);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
        setConfirmDeleteOpen(false);

        if (confirmed && pagamentoToDelete) {
            if (isLocalMode) {
                const novosPagamentos = pagamentos.filter((_, i) => i !== deleteIndex);
                onPagamentosChange?.(novosPagamentos);
                notifications.show({ message: 'Pagamento removido', severity: 'success' });
            } else if (pagamentoToDelete.id) {
                const { error } = await removerPagamento(agendamentoId!, pagamentoToDelete.id);

                if (error) {
                    notifications.show({ message: error, severity: 'error' });
                } else {
                    notifications.show({ message: 'Pagamento removido e agendamento atualizado!', severity: 'success' });
                    const { data: novoResumo } = await getResumoFinanceiro(agendamentoId!);
                    if (novoResumo) {
                        setResumo(novoResumo);
                        onPagamentoChange?.(novoResumo.statusPagamento, novoResumo.valorPagoTotal);
                    }
                }
            }
        }

        setPagamentoToDelete(null);
        setDeleteIndex(-1);
    };

    if (loading && !isLocalMode) {
        return (
            <Card {...cardStyles}>
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={32} />
                </Box>
            </Card>
        );
    }

    if (!isLocalMode && !resumo) {
        return (
            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning">
                        Não foi possível carregar as informações de pagamento.
                    </Alert>
                </Box>
            </Card>
        );
    }

    return (
        <>
            <Card {...cardStyles}>
                <Box sx={{ p: 3 }}>
                    <SectionHeader
                        icon={<CurrencyExchange />}
                        title="Informações de Pagamentos"
                        action={
                            podeCriarPagamento && podeReceberPagamento && displayValorTotal > 0 && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenDialog}
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Adicionar
                                </Button>
                            )
                        }
                    />

                    {/* Resumo Financeiro */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Valor Total
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {formatCurrency(displayValorTotal)}
                                </Typography>
                            </Grid>

                            <Grid size={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Valor Pago
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                    {formatCurrency(valorPagoTotal)}
                                </Typography>
                            </Grid>

                            <Grid size={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Saldo Restante
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={displaySaldoRestante > 0 ? 'warning.main' : 'success.main'}
                                >
                                    {formatCurrency(displaySaldoRestante)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Alerta de Agendamento Quitado */}
                    {isPago && (
                        <Alert
                            severity="success"
                            icon={<CheckCircleIcon />}
                            sx={{ mb: 2, borderRadius: 2 }}
                        >
                            <Typography fontWeight="bold">
                                Este agendamento está totalmente quitado.
                            </Typography>
                        </Alert>
                    )}

                    {/* Lista de Pagamentos */}
                    {pagamentos.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Data</TableCell>
                                        <TableCell>Forma de pagamento</TableCell>
                                        <TableCell align="right">Valor</TableCell>
                                        <TableCell>Observação</TableCell>
                                        {podeExcluirPagamento && (
                                            <TableCell align="center" width={60}>Ações</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagamentos.map((pagamento, index) => (
                                        <TableRow key={pagamento.id || index} hover>
                                            <TableCell>
                                                {dayjs(pagamento.dataRecebimento).format('DD/MM/YYYY')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={pagamento.formaPagamentoDescricao || pagamento.formaPagamento}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography fontWeight="bold" color="success.main">
                                                    {formatCurrency(pagamento.valorPago)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {pagamento.observacao || '-'}
                                            </TableCell>
                                            {podeExcluirPagamento && (
                                                <TableCell align="center">
                                                    <Tooltip title="Remover pagamento">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteClick(pagamento, index)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography
                            align="center"
                            color="text.secondary"
                            py={4}
                            sx={{ fontStyle: 'italic' }}
                        >
                            Nenhum pagamento registrado
                        </Typography>
                    )}
                </Box>
            </Card>

            {/* Modal de Adicionar Pagamento */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <Dialog
                    open={dialogOpen}
                    onClose={(_event, reason) => {
                        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                            return;
                        }
                        handleCloseDialog();
                    }}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            overflow: 'hidden',
                        },
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 3,
                            py: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                }}
                            >
                                <PaymentIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    Registrar Pagamento
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Saldo restante: {formatCurrency(displaySaldoRestante)}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={handleCloseDialog}
                            disabled={submitting}
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                    color: 'error.main',
                                },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{ px: 3, py: 3 }}>
                        <Stack spacing={2.5}>
                            <MoneyInput
                                fullWidth
                                size="small"
                                label="Valor do Pagamento"
                                value={form.valorPago}
                                onChange={(val) => setForm({ ...form, valorPago: val })}
                                required
                                error={isValorExcedido}
                                helperText={
                                    isValorExcedido
                                        ? `O valor não pode exceder o saldo restante (${formatCurrency(displaySaldoRestante)})`
                                        : undefined
                                }
                            />

                            <DatePicker
                                label="Data de Recebimento"
                                value={form.dataRecebimento}
                                onChange={(date) => setForm({ ...form, dataRecebimento: date })}
                                maxDate={dayjs()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        size: 'small',
                                        error: isDataFutura,
                                        helperText: isDataFutura
                                            ? 'A data não pode ser futura'
                                            : undefined,
                                    },
                                }}
                            />

                            <FormControl fullWidth required size="small">
                                <InputLabel>Forma de Pagamento</InputLabel>
                                <Select
                                    value={form.formaPagamento}
                                    label="Forma de Pagamento"
                                    onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })}
                                >
                                    {FORMAS_PAGAMENTO.map((fp) => (
                                        <MenuItem key={fp.value} value={fp.value}>
                                            {fp.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                size="small"
                                label="Observação"
                                multiline
                                rows={2}
                                value={form.observacao}
                                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                                inputProps={{ maxLength: 500 }}
                                placeholder="Informações adicionais sobre o pagamento..."
                            />
                        </Stack>
                    </Box>

                    {/* Actions */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                            borderTop: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={handleCloseDialog}
                            disabled={submitting}
                            variant="outlined"
                            color="inherit"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 3,
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={submitting || hasValidationErrors}
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {submitting ? 'Salvando...' : 'Confirmar Pagamento'}
                        </Button>
                    </Box>
                </Dialog>
            </LocalizationProvider>

            {/* Dialog de Confirmação de Exclusão */}
            <ConfirmDeleteDialog
                open={confirmDeleteOpen}
                payload={{
                    itemName: pagamentoToDelete
                        ? `${formatCurrency(pagamentoToDelete.valorPago)} - ${pagamentoToDelete.formaPagamentoDescricao || pagamentoToDelete.formaPagamento}`
                        : '',
                    itemType: 'o pagamento',
                }}
                onClose={handleConfirmDelete}
            />
        </>
    );
}
