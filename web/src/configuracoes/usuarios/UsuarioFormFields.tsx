import React from 'react';
import {
    Autocomplete,
    Card,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import { Visibility, VisibilityOff, VpnKey } from '@mui/icons-material';
import { PerfilDTO, PerfilService } from './UsuarioService';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { CustomSwitch } from '../../components/CustomSwitch';
import { useParams } from 'react-router-dom';

export interface UsuarioFormValues {
    login: string;
    nome: string;
    senha: string;
    perfilId: number | null;
    ativo: boolean;
}

interface UsuarioFormFieldsProps {
    values: UsuarioFormValues;
    errors: Record<string, string>;
    onFieldChange: (field: keyof UsuarioFormValues, value: string | boolean | number | null) => void;
    isEdit?: boolean;
    showPassword?: boolean;
}

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
}

function SectionHeader({ icon, title, action }: SectionHeaderProps) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: 'divider',
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Stack>
            {action}
        </Stack>
    );
}

export default function UsuarioFormFields({
    values,
    errors,
    onFieldChange,
    isEdit = false,
    showPassword = true,
}: UsuarioFormFieldsProps) {
    const { id } = useParams<{ id: string }>();
    const isNew = !id;

    const [perfis, setPerfis] = React.useState<PerfilDTO[]>([]);
    const [loadingPerfis, setLoadingPerfis] = React.useState(true);
    const [showPasswordField, setShowPasswordField] = React.useState(false);
    const [loginError, setLoginError] = React.useState<string | null>(null);
    const MIN_BEFORE = 3;
    const MAX_BEFORE = 20;
    const MIN_AFTER = 3;
    const MAX_AFTER = 20;

    const handleLoginChange = (value: string) => {
        const normalized = value.toLowerCase();
        onFieldChange('login', normalized);

        if (!normalized) {
            setLoginError(null);
            return;
        }

        if (!/^[a-z.]+$/.test(normalized)) {
            setLoginError('O login deve conter apenas letras minúsculas e um ponto.');
            return;
        }

        const parts = normalized.split('.');
        if (parts.length !== 2) {
            setLoginError('O login deve estar no formato nome.sobrenome.');
            return;
        }

        const [before, after] = parts;

        if (before.length < MIN_BEFORE) {
            setLoginError(`O nome deve ter no mínimo ${MIN_BEFORE} caracteres.`);
            return;
        }

        if (before.length > MAX_BEFORE) {
            setLoginError(`O nome deve ter no máximo ${MAX_BEFORE} caracteres.`);
            return;
        }

        if (after.length < MIN_AFTER) {
            setLoginError(`O sobrenome deve ter no mínimo ${MIN_AFTER} caracteres.`);
            return;
        }

        if (after.length > MAX_AFTER) {
            setLoginError(`O sobrenome deve ter no máximo ${MAX_AFTER} caracteres.`);
            return;
        }

        setLoginError(null);
    };

    React.useEffect(() => {
        const loadPerfis = async () => {
            const result = await PerfilService.listarAtivos();
            if (result.data) {
                setPerfis(result.data);
            }
            setLoadingPerfis(false);
        };
        loadPerfis();
    }, []);

    return (
        <>
        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            <SectionHeader
                icon={<PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                title="Dados do Usuário"
            />
            <Stack spacing={3} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Nome"
                            placeholder="Nome exibido no sistema"
                            value={values.nome ?? ''}
                            onChange={(e) => onFieldChange('nome', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                        />
                    </Grid>

                    <Grid size={1}>
                        <FormControlLabel
                            control={
                                <CustomSwitch
                                    checked={values.ativo ?? false}
                                    onChange={(e) => onFieldChange('ativo', e.target.checked)}
                                />
                            }
                            label='Ativo'
                            disabled={isNew}
                        />
                    </Grid>

                    <Grid size={5}/>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={perfis}
                            getOptionLabel={(option) =>
                                option?.descricao ? `${option.nome} - ${option.descricao}` : option.nome
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={loadingPerfis}
                            value={perfis.find(p => p.id === values.perfilId) ?? null}
                            onChange={(_, newValue) => {
                                onFieldChange('perfilId', newValue?.id ?? null);
                            }}
                            noOptionsText="Nenhum perfil encontrado"
                            loadingText="Carregando..."
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Perfil"
                                    required
                                    error={!!errors.perfilId}
                                    helperText={errors.perfilId}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Card>

        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            <SectionHeader
                icon={<VpnKey sx={{ color: 'primary.main', fontSize: 22 }} />}
                title="Acesso ao sistema"
            />
            <Stack spacing={3} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Login"
                            placeholder="nome.sobrenome"
                            value={values.login ?? ''}
                            onChange={(e) => handleLoginChange(e.target.value)}
                            error={!!loginError || !!errors.login}
                            inputProps={{
                                pattern: "[a-z]{3,20}\\.[a-z]{2,20}"
                            }}
                            helperText={loginError ?? errors.login}
                        />
                    </Grid>

                    <Grid size={6}/>

                    <Grid size={{ xs: 12, md: 6 }}>
                        {showPassword && !isEdit && (
                            <Stack spacing={1}>
                                <TextField
                                    label="Senha"
                                    size="small"
                                    type={showPasswordField ? 'text' : 'password'}
                                    value={values.senha}
                                    onChange={(e) => onFieldChange('senha', e.target.value)}
                                    error={!!errors.senha}
                                    required
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPasswordField(!showPasswordField)}
                                                    edge="end"
                                                >
                                                    {showPasswordField ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Validações em tempo real */}
                                {values.senha && (
                                    <Stack spacing={0.5} sx={{ pl: 1 }}>
                                        <Typography
                                            variant="caption"
                                            color={values.senha.length >= 8 ? 'success.main' : 'error.main'}
                                        >
                                            • Mínimo 8 caracteres
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={/[A-Z]/.test(values.senha) ? 'success.main' : 'error.main'}
                                        >
                                            • Uma letra maiúscula
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={/[a-z]/.test(values.senha) ? 'success.main' : 'error.main'}
                                        >
                                            • Uma letra minúscula
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={/\d/.test(values.senha) ? 'success.main' : 'error.main'}
                                        >
                                            • Um número
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={/[!@#$%^&*(),.?":{}|<>]/.test(values.senha) ? 'success.main' : 'error.main'}
                                        >
                                            • Um caractere especial
                                        </Typography>
                                    </Stack>
                                )}

                                {errors.senha && (
                                    <Typography variant="caption" color="error.main" sx={{ pl: 1 }}>
                                        {errors.senha}
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </Stack>
        </Card>
        </>
    );
}
