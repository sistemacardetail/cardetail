import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, } from '@mui/material';
import { DialogComponentProps } from '../hooks/useDialogs';

export interface ConfirmDeletePayload {
    itemName: string;
    itemType?: string;
}

export default function ConfirmDeleteDialog({
                                                open,
                                                payload,
                                                onClose,
                                            }: DialogComponentProps<ConfirmDeletePayload, boolean>) {
    if (!payload) return null;

    const { itemName, itemType = 'item' } = payload;

    const handleConfirm = () => onClose(true);
    const handleCancel = () => onClose(false);

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') return;
                handleCancel();
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                },
            }}
        >
            <DialogTitle sx={{ pb: 0 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Typography variant="h6" fontWeight={600}>
                        Confirmar exclusão
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Typography
                    variant="body1"
                    sx={{ mt: 1.5 }}
                >
                    Deseja realmente excluir{' '}
                    <strong>{itemType}</strong>{' '}
                    <strong>{itemName}</strong>?
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                <Button
                    onClick={handleCancel}
                    variant="text"
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Cancelar
                </Button>

                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    }}
                >
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
}