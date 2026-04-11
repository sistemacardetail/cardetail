import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import AgendamentoFormFields from './AgendamentoFormFields';
import AgendamentoPagamentos from './AgendamentoPagamentos';
import {
    AgendamentoDTO,
    AgendamentoStatus,
    getAgendamentoById,
    splitAgendamentoServicosForApi,
    updateAgendamento,
    updateAgendamentoStatus
} from './AgendamentoService';
import { useAgendamentoForm } from './useAgendamentoForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tab,
    Tabs
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';
import { getStatusPagamentoColor, getStatusPagamentoLabel } from '../utils';
import { MonetizationOn } from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`agendamento-tabpanel-${index}`}
            aria-labelledby={`agendamento-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

interface AgendamentoEditFormProps {
    initialValues: AgendamentoDTO;
    tabValue: number;
    onTabChange: (newValue: number) => void;
}

function AgendamentoEditForm({ initialValues, tabValue, onTabChange }: AgendamentoEditFormProps) {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const fromPath = (location.state as { from?: string })?.from || '/app/agendamentos';
    const { hasPermissao } = useAuth();

    const podeVisualizarPagamentos = hasPermissao(PERMISSOES.AGENDAMENTOS_PAGAMENTOS_VISUALIZAR);

    const {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handlePeriodoChange,
        handleVeiculoChange,
        handlePacoteChange,
        handleAddServico,
        handleRemoveServico,
        handleServicoChange,
        handleServicoValorChange,
        reset,
        validate,
        valorTotal,
        valorFinal,
        tempoEstimadoTotal,
        updatePagamentoInfo,
    } = useAgendamentoForm(initialValues);

    const podeCancelar = !values.statusPagamento || values.statusPagamento === 'PENDENTE';
    const [showCancelarDialog, setShowCancelarDialog] = React.useState(false);
    const [loadingAction, setLoadingAction] = React.useState(false);
    const [pagamentosVersion, setPagamentosVersion] = React.useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        onTabChange(newValue);
    };

    const handlePagamentoChange = (statusPagamento?: string, valorPagoTotal?: number) => {
        updatePagamentoInfo(statusPagamento, valorPagoTotal);
        setPagamentosVersion(v => v + 1);
    };

    const handleSubmit = React.useCallback(async () => {
        if (values.status === 'CANCELADO') {
            notifications.show({
                message: 'Não é permitido alterar agendamento com status '+values.status+'!',
                severity: 'warning',
            });
            return;
        }

        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'error',
            });
            return;
        }

        const agendamentoData = splitAgendamentoServicosForApi(values) as AgendamentoDTO & { pagamentos?: unknown };
        delete agendamentoData.pagamentos;

        const result = await updateAgendamento(id!, agendamentoData as AgendamentoDTO);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({
                message: errorMessage,
                severity: 'error',
            });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({
            message: 'Agendamento atualizado com sucesso!',
            severity: 'success',
        });
        navigate(fromPath);
    }, [values, id, navigate, notifications, validate, setErrors, fromPath]);

    const handleCancelarClick = () => {
        setShowCancelarDialog(true);
    };

    const handleStatusChange = async (newStatus: AgendamentoStatus) => {
        if (!values?.id) return;

        const { error } = await updateAgendamentoStatus(values.id, newStatus);

        if (error) {
            notifications.show({ message: error, severity: 'error' });
        }
    };

    const handleCancelarConfirm = async () => {
        setLoadingAction(true);
        try {
            await handleStatusChange('CANCELADO');

            notifications.show({
                message: 'Agendamento cancelado com sucesso!',
                severity: 'success',
            });

            setShowCancelarDialog(false);
            navigate(fromPath);
        } catch (error) {
            notifications.show({
                message: 'Não foi possível cancelar o agendamento.',
                severity: 'error',
            });
            console.error(error);
        } finally {
            setLoadingAction(false);
        }
    };

    const statusPagamento = values.statusPagamento || 'PENDENTE';

    return (
        <>
            <Box
                sx={{
                    mb: 3,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    borderRadius: 2,
                    p: 0.5,
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Abas do agendamento"
                    TabIndicatorProps={{
                        sx: { display: 'none' },
                    }}
                    sx={{
                        minHeight: 48,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minHeight: 44,
                            borderRadius: 1.5,
                            mx: 0.25,
                            px: 2.5,
                            transition: 'all 0.2s ease',
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                color: 'primary.main',
                            },
                            '&.Mui-selected': {
                                bgcolor: 'background.paper',
                                color: 'primary.main',
                                boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
                            },
                        },
                    }}
                >
                    <Tab
                        icon={<EventIcon sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Agendamento"
                        id="agendamento-tab-0"
                        aria-controls="agendamento-tabpanel-0"
                    />
                    {podeVisualizarPagamentos && (
                        <Tab
                            icon={<MonetizationOn sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>Pagamento</span>
                                    <Chip
                                        label={getStatusPagamentoLabel(statusPagamento)}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            bgcolor: alpha(getStatusPagamentoColor(statusPagamento), 0.12),
                                            color: getStatusPagamentoColor(statusPagamento),
                                            border: 1,
                                            borderColor: alpha(getStatusPagamentoColor(statusPagamento), 0.3),
                                            '& .MuiChip-label': { px: 1 },
                                        }}
                                    />
                                </Box>
                            }
                            id="agendamento-tab-1"
                            aria-controls="agendamento-tabpanel-1"
                            disabled={!values.id}
                        />
                    )}
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <CrudForm
                    onSubmit={handleSubmit}
                    onReset={reset}
                    backButtonPath={fromPath}
                    permission={PERMISSOES.AGENDAMENTOS_EDITAR}
                    isDirty={isDirty}
                    extraActions={
                        <>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelarClick}
                                disabled={loadingAction || !podeCancelar}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                }}
                            >
                                Cancelar Agendamento
                            </Button>
                        </>
                    }
                >
                    <AgendamentoFormFields
                        values={values}
                        onChange={handleChange}
                        onPeriodoChange={handlePeriodoChange}
                        onVeiculoChange={handleVeiculoChange}
                        onPacoteChange={handlePacoteChange}
                        onAddServico={handleAddServico}
                        onRemoveServico={handleRemoveServico}
                        onServicoChange={handleServicoChange}
                        onServicoValorChange={handleServicoValorChange}
                        valorTotal={valorTotal}
                        valorFinal={valorFinal}
                        tempoEstimadoTotal={tempoEstimadoTotal}
                        errors={errors}
                        agendamentoId={id}
                    />
                </CrudForm>
            </TabPanel>

            {podeVisualizarPagamentos && (
                <TabPanel value={tabValue} index={1}>
                    {values.id && (
                        <AgendamentoPagamentos
                            key={pagamentosVersion}
                            agendamentoId={values.id}
                            valorTotalAgendamento={valorFinal}
                            onPagamentoChange={handlePagamentoChange}
                            statusAgendamento={values.status}
                        />
                    )}
                </TabPanel>
            )}

            <Dialog open={showCancelarDialog} onClose={() => setShowCancelarDialog(false)}>
                <DialogTitle>Cancelar Agendamento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja cancelar o agendamento número {values.numero}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCancelarDialog(false)} disabled={loadingAction}>
                        Não
                    </Button>
                    <Button
                        onClick={handleCancelarConfirm}
                        variant="contained"
                        color="error"
                        disabled={loadingAction}
                    >
                        Sim, Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default function AgendamentoEdit() {
    const [tabValue, setTabValue] = React.useState(0);

    return (
        <CrudEdit<AgendamentoDTO>
            title=""
            breadcrumbs={[
                { title: 'Agendamentos', path: '/app/agendamentos' },
                { title: 'Editar' },
            ]}
            loadFn={getAgendamentoById}
        >
            {(data) => (
                <AgendamentoEditForm
                    initialValues={data}
                    tabValue={tabValue}
                    onTabChange={setTabValue}
                />
            )}
        </CrudEdit>
    );
}
