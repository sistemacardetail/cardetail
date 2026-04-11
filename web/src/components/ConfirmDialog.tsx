import React from 'react';
import {
    alpha,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from '@mui/material';
import { DialogComponentProps } from '../hooks/useDialogs';

export interface ConfirmDialogPayload {
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';
}

export default function ConfirmDialog({
  open,
  payload,
  onClose,
}: DialogComponentProps<ConfirmDialogPayload, boolean>) {
    if (!payload) return null;

    const {
        title,
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        confirmColor = 'primary',
    } = payload;

    const handleConfirm = () => onClose(true);
    const handleCancel = () => onClose(false);

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') return;
                handleCancel();
            }}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        minWidth: 360,
                        maxWidth: 440,
                    },
                },
            }}
        >
            <DialogTitle
                id="confirm-dialog-title"
                sx={{
                    pb: 2,
                    pt: 2,
                    px: 3,
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography variant="h6" fontWeight={600}>
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                <DialogContentText
                    id="confirm-dialog-description"
                    component="div"
                    sx={{
                        color: 'text.secondary',
                        fontSize: 14,
                        lineHeight: 1.6,
                    }}
                >
                    {message}
                </DialogContentText>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 2.5,
                    pt: 2,
                    gap: 1,
                }}
            >
                <Button
                    onClick={handleCancel}
                    color="inherit"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: alpha('#000', 0.04),
                        },
                    }}
                >
                    {cancelText}
                </Button>

                <Button
                    onClick={handleConfirm}
                    color={confirmColor}
                    variant="contained"
                    disableElevation
                    autoFocus
                    sx={{
                        px: 2.5,
                        fontWeight: 600,
                        textTransform: 'none',
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}