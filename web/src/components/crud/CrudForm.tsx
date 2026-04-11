import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionPageGuard } from '../PermissionGuard';
import { checkPermission } from './CrudList';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { useDialogs } from '../../hooks/useDialogs';
import ConfirmDialog from '../ConfirmDialog';

export interface CrudFormProps {
    children: React.ReactNode;
    onSubmit: () => Promise<void>;
    onReset?: () => void;
    submitButtonLabel?: string;
    backButtonPath: string;
    extraActions?: React.ReactNode;
    permission?: string;
    isDirty?: boolean;
}

export default function CrudForm({
    children,
    onSubmit,
    onReset,
    submitButtonLabel = 'Salvar',
    backButtonPath,
    extraActions,
    permission,
    isDirty = false,
}: Readonly<CrudFormProps>) {

    const { hasPermissao } = useAuth();
    const allowSave = checkPermission(permission, hasPermissao);

    const navigate = useNavigate();
    const dialogs = useDialogs();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    useUnsavedChanges({ isDirty });

    const handleBack = React.useCallback(async () => {
        if (isDirty) {
            const confirmed = await dialogs.open(ConfirmDialog, {
                title: 'Alterações não salvas',
                message: 'Deseja realmente sair? As informações não salvas serão perdidas.',
                confirmText: 'Sair',
                cancelText: 'Continuar editando',
                confirmColor: 'warning',
            });
            if (confirmed) {
                navigate(backButtonPath);
            }
        } else {
            navigate(backButtonPath);
        }
    }, [isDirty, dialogs, navigate, backButtonPath]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PermissionPageGuard permissao={permission}>
        <Box
            component="form"
            onSubmit={handleSubmit}
            onReset={onReset}
            sx={{ width: '100%' }}
        >
            <FormGroup>
                <Stack spacing={3}>
                    {children}
                </Stack>
            </FormGroup>

            <Stack
                direction="row"
                justifyContent="space-between"
                mt={4}
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Voltar
                </Button>


                <Stack direction="row" spacing={2}>
                    {extraActions}

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !allowSave}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                            },
                        }}
                    >
                        {isSubmitting ? 'Salvando...' : submitButtonLabel}
                    </Button>
                </Stack>
            </Stack>
        </Box>
        </PermissionPageGuard>
    );
}
