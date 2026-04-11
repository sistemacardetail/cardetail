import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import { useNotifications } from '../../hooks/useNotifications';
import { createCorVeiculoWithResponse } from './CorVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';

interface CorVeiculoModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (cor: any) => void;
}

export default function CorVeiculoModal({ open, onClose, onSuccess }: CorVeiculoModalProps) {
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);
    const [nome, setNome] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setNome('');
            setErrors({});
        }
    }, [open]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!nome.trim()) {
            newErrors.nome = 'Nome da cor é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const result = await createCorVeiculoWithResponse({
                nome: nome.trim(),
            });

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

            if (result.data) {
                notifications.show({
                    message: 'Cor criada com sucesso!',
                    severity: 'success',
                });
                onSuccess(result.data);
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_event, reason) => {
                // Impede fechamento por clique fora ou ESC
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                onClose();
            }}
            maxWidth="xs"
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
                        <PaletteIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            Nova Cor de Veículo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Digite o nome da cor para cadastrar
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    disabled={loading}
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
            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={2.5}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome da Cor"
                        required
                        value={nome}
                        onChange={(e) => {
                            setNome(e.target.value);
                            if (e.target.value.trim() && errors.nome) {
                                setErrors((prev) => ({ ...prev, nome: '' }));
                            }
                        }}
                        error={!!errors.nome}
                        helperText={errors.nome}
                        placeholder="Ex: Branco, Preto, Prata..."
                        autoFocus
                    />
                </Stack>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    borderTop: 1,
                    borderColor: 'divider',
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
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
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
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
                    {loading ? 'Salvando...' : 'Salvar Cor'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
