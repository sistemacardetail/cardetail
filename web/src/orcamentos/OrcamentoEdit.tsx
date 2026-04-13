import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    Typography
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PrintIcon from '@mui/icons-material/Print';
import { useNotifications } from '../hooks/useNotifications';
import { CrudEdit, CrudForm } from '../components/crud';
import OrcamentoFormFields from './OrcamentoFormFields';
import {
    cancelarOrcamento,
    downloadOrcamentoPdf,
    getOrcamentoById,
    OrcamentoDTO,
    splitOrcamentoServicosForApi,
    updateOrcamento,
} from './OrcamentoService';
import { useOrcamentoForm } from './useOrcamentoForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { alpha } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDialogs } from '../hooks/useDialogs';

interface OrcamentoEditFormProps {
    initialValues: OrcamentoDTO;
}

function OrcamentoEditForm({ initialValues }: OrcamentoEditFormProps) {
    const navigate = useNavigate();
    const dialogs = useDialogs();
    const notifications = useNotifications();
    const { id } = useParams<{ id: string }>();

    const [showCancelarDialog, setShowCancelarDialog] = React.useState(false);
    const [loadingAction, setLoadingAction] = React.useState(false);

    const {
        values,
        errors,
        setErrors,
        isDirty,
        clearDirty,
        cliente,
        handleChange,
        handleClienteChange,
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
    } = useOrcamentoForm(initialValues);

    const isOrcado = values.status === 'PENDENTE';
    const canEdit = isOrcado;

    const { hasPermissao } = useAuth();
    const canGenerateAgendamento = hasPermissao(PERMISSOES.AGENDAMENTOS_CRIAR);

    const handleSubmit = React.useCallback(async () => {
        if (!canEdit) {
            notifications.show({
                message: 'Não é permitido alterar orçamento com status '+values.status+'!',
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

        const orcamentoData = splitOrcamentoServicosForApi(values);

        const result = await updateOrcamento(id!, orcamentoData);

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
            message: 'Orçamento atualizado com sucesso!',
            severity: 'success',
        });
        navigate('/app/orcamentos');
    }, [canEdit, values, id, navigate, notifications, validate, setErrors]);

    const handleConverterClick = async () => {
        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'warning',
            });
            return;
        }

        const confirmed = await dialogs.open(ConfirmDialog, {
            title: 'Confirmação',
            message: (
                <Stack spacing={1.5}>
                    <Typography variant="body2" color="text.secondary">
                        Gerar agendamento a partir do orçamento número {' '}
                        <strong>{values.numero}</strong>?
                    </Typography>
                </Stack>
            ),
            confirmText: 'Gerar Agendamento',
            cancelText: 'Cancelar',
            confirmColor: 'success',
        });

        if (!confirmed) return;

        navigate('/app/agendamentos/novo', {
            state: {
                from: '/app/orcamentos',
                orcamento: values,
            },
        });
    };

    // Cancelar Orçamento
    const handleCancelarClick = () => {
        setShowCancelarDialog(true);
    };

    const handleCancelarConfirm = async () => {
        setLoadingAction(true);
        try {
            await cancelarOrcamento(id!);

            notifications.show({
                message: 'Orçamento cancelado com sucesso!',
                severity: 'success',
            });

            setShowCancelarDialog(false);
            navigate('/app/orcamentos');
        } catch (error) {
            notifications.show({
                message: 'Não foi possível cancelar o orçamento.',
                severity: 'error',
            });
            console.error(error);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleSave = React.useCallback(async () => {
        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'error',
            });
            return false;
        }

        if (!canEdit) {
            return false;
        }

        const result = await updateOrcamento(id!, splitOrcamentoServicosForApi(values));

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
            return false;
        }

        return true;
    }, [canEdit, values, id, notifications, validate, setErrors]);

    const handleImprimir = async () => {
        setLoadingAction(true);
        try {
            if (isOrcado) {
                const saved = await handleSave();

                if (!saved) {
                    return;
                }
                clearDirty();
            }

            const result = await downloadOrcamentoPdf(id!, values.numero || 0);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                return;
            }

            notifications.show({
                message: 'PDF gerado com sucesso!',
                severity: 'success',
            });
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <>
            <CrudForm
                onSubmit={handleSubmit}
                onReset={canEdit ? reset : undefined}
                backButtonPath="/app/orcamentos"
                permission={PERMISSOES.ORCAMENTOS_EDITAR}
                isDirty={isDirty}
                extraActions={
                    <>
                        {isOrcado && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelarClick}
                                disabled={loadingAction}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                }}
                            >
                                Cancelar Orçamento
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handleImprimir}
                            disabled={loadingAction}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                boxShadow: 'none',
                                '&:hover': { boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` },
                            }}
                        >
                            Imprimir
                        </Button>

                        {isOrcado && canGenerateAgendamento && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<EventIcon/>}
                                onClick={handleConverterClick}
                                disabled={loadingAction}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    boxShadow: 'none',
                                    '&:hover': {boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`},
                                }}
                            >
                                Gerar Agendamento
                            </Button>
                        )}
                    </>
                }
                >

                <OrcamentoFormFields
                    values={values}
                    onChange={handleChange}
                    cliente={cliente}
                    onClienteChange={handleClienteChange}
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
                />
            </CrudForm>

            {/* Dialog para Cancelar Orçamento */}
            <Dialog open={showCancelarDialog} onClose={() => setShowCancelarDialog(false)}>
                <DialogTitle>Cancelar Orçamento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja cancelar o orçamento número {values.numero}?
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

export default function OrcamentoEdit() {
    return (
        <CrudEdit<OrcamentoDTO>
            title=""
            breadcrumbs={[
                { title: 'Orçamentos', path: '/app/orcamentos' },
                { title: 'Editar' },
            ]}
            loadFn={getOrcamentoById}
        >
            {(data) => (
                <OrcamentoEditForm initialValues={data} />
            )}
        </CrudEdit>
    );
}
