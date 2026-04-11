import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DialogComponentProps } from '../../hooks/useDialogs';
import { UsuarioService } from './UsuarioService';
import { useNotifications } from '../../hooks/useNotifications';

export interface ResetSenhaDialogData {
    usuarioId: string;
    usuarioNome: string;
}

export default function UsuarioResetPassword(
    props: DialogComponentProps<ResetSenhaDialogData, void>
) {
    const { open, payload, onClose } = props;
    const { usuarioId, usuarioNome } = payload;
    const notifications = useNotifications();

    const [senha, setSenha] = React.useState('');
    const [confirmarSenha, setConfirmarSenha] = React.useState('');
    const [showSenha, setShowSenha] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleResetSenha = async () => {
        if (senha !== confirmarSenha) {
            notifications.show({ message: 'As senhas não coincidem', severity: 'error' });
            return;
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!regex.test(senha)) {
            notifications.show({ message: 'Senha não atende aos critérios mínimos', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const result = await UsuarioService.resetarSenha(usuarioId, { novaSenha: senha });
            if (result.error) {
                notifications.show({ message: result.error, severity: 'error' });
            } else {
                notifications.show({ message: `Senha do usuário ${usuarioNome} resetada com sucesso!`, severity: 'success' });
                await onClose(undefined); // tipo R = void
            }
        } catch (err: any) {
            notifications.show({ message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose(undefined);
    };

    return (
        <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogContent>
                <DialogContentText>Usuário: <strong>{usuarioNome}</strong></DialogContentText>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        label="Nova Senha"
                        type={showSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowSenha(!showSenha)}>
                                        {showSenha ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Confirmar Senha"
                        type={showSenha ? 'text' : 'password'}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={loading}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleResetSenha}
                    disabled={loading || !senha || !confirmarSenha}
                >
                    Resetar
                </Button>
            </DialogActions>
        </Dialog>
    );
}