import React, { useEffect, useState } from 'react';
import {
    Alert,
    alpha,
    Box,
    Button,
    CircularProgress,
    Fade,
    IconButton,
    InputAdornment,
    Skeleton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { DirectionsCar, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authenticate } from './LoginService';
import { useAuth } from '../Main';

const LoginForm = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, refreshAuth } = useAuth();
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    useEffect(() => {
        if (isAuthenticated === true) {
            navigate('/app', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (message) setMessage(null);
    };

    const handleLogin = async () => {
        if (!isFormValid || isLoading) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await authenticate(form);

            if (response?.successMessage) {
                localStorage.setItem('username', form.username);
                setMessage({ text: response.successMessage, type: 'success' });
                await new Promise(resolve => setTimeout(resolve, 500));
                await refreshAuth();
                navigate('/app', { replace: true });
            } else {
                setMessage({ text: response?.errorMessage || 'Usuário ou senha inválidos.', type: 'error' });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            setMessage({ text: 'Erro interno. Tente novamente.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isFormValid && !isLoading) {
            handleLogin();
        }
    };

    const isFormValid = form.username.trim() !== '' && form.password.trim() !== '';

    // Loading inicial com skeleton estilizado
    if (isAuthenticated === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    bgcolor: '#f5f5f5',
                }}
            >
                <Box
                    sx={{
                        flex: { xs: 0, md: 1 },
                        display: { xs: 'none', md: 'block' },
                    }}
                >
                    <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
                </Box>
                <Box
                    sx={{
                        flex: { xs: 1, md: '0 0 480px' },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4,
                    }}
                >
                    <CircularProgress size={48} sx={{ color: primaryColor, mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Carregando...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            {/* Lado esquerdo - destaque visual */}
            <Box
                sx={{
                    flex: { xs: 0, md: 1 },
                    position: 'relative',
                    display: { xs: 'none', md: 'block' },
                    overflow: 'hidden',
                }}
            >
                <Fade in timeout={800}>
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                `radial-gradient(circle at 20% 20%, ${alpha(primaryColor, 0.35)} 0%, transparent 45%),
                                 radial-gradient(circle at 80% 80%, ${alpha(primaryColor, 0.25)} 0%, transparent 40%),
                                 linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0b1220 100%)`,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)',
                                pointerEvents: 'none',
                            },
                        }}
                    />
                </Fade>
                <Fade in timeout={1200}>
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 4,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                mb: 1,
                            }}
                        >
                            Detail Flow
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 400,
                            }}
                        >
                            Tudo o que sua estética automotiva precisa, em um sistema inteligente feito para crescer com você.
                        </Typography>
                    </Box>
                </Fade>
            </Box>

            {/* Divisória vertical com gradiente da cor primária */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: 4,
                    background: `linear-gradient(180deg, ${primaryColor}, ${primaryColor}80)`,
                    flexShrink: 0,
                }}
            />

            {/* Lado direito - Formulário */}
            <Box
                sx={{
                    flex: { xs: 1, md: '0 0 476px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 3, sm: 4, md: 6 },
                    bgcolor: 'background.paper',
                    position: 'relative',
                }}
            >
                {/* Detalhe decorativo com cor primária no topo */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80)`,
                    }}
                />

                {/* Header mobile com imagem */}
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: `0 4px 20px ${primaryColor}40`,
                        }}
                    >
                        <DirectionsCar sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                        Car Detail
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 360,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 0.5,
                        }}
                    >
                        Acesse sua conta
                    </Typography>

                    {message && (
                        <Fade in timeout={300}>
                            <Alert
                                severity={message.type}
                                role="alert"
                                aria-live="polite"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    '& .MuiAlert-icon': {
                                        alignItems: 'center',
                                    },
                                    ...(message.type === 'error' && {
                                        bgcolor: 'rgba(211, 47, 47, 0.08)',
                                        border: '1px solid rgba(211, 47, 47, 0.3)',
                                        '& .MuiAlert-icon': {
                                            color: '#D32F2F',
                                        },
                                    }),
                                    ...(message.type === 'success' && {
                                        bgcolor: 'rgba(46, 125, 50, 0.08)',
                                        border: '1px solid rgba(46, 125, 50, 0.3)',
                                        '& .MuiAlert-icon': {
                                            color: '#2E7D32',
                                        },
                                    }),
                                }}
                            >
                                {message.text}
                            </Alert>
                        </Fade>
                    )}

                    <Box
                        component="form"
                        noValidate
                        aria-label="Formulário de login"
                    >
                        <TextField
                            label="Usuário"
                            name="username"
                            id="username"
                            value={form.username}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            autoComplete="username"
                            disabled={isLoading}
                            onKeyDown={handleKeyDown}
                            inputProps={{
                                'aria-required': true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: '#FAFAFA',
                                    transition: 'all 0.2s ease',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.32)',
                                        borderWidth: 1.5,
                                    },
                                    '&:hover': {
                                        bgcolor: '#F5F5F5',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: primaryColor,
                                            borderWidth: 2,
                                        },
                                    },
                                    '&.Mui-focused': {
                                        bgcolor: '#FFFFFF',
                                        boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.2)}`,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: primaryColor,
                                            borderWidth: 2,
                                        },
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        opacity: 0.7,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(0, 0, 0, 0.7)',
                                    fontWeight: 500,
                                    '&.Mui-focused': {
                                        color: primaryColor,
                                        fontWeight: 600,
                                    },
                                },
                            }}
                        />

                        <TextField
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            autoComplete="current-password"
                            disabled={isLoading}
                            onKeyDown={handleKeyDown}
                            inputProps={{
                                'aria-required': true,
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                                disabled={isLoading}
                                                sx={{
                                                    color: 'text.secondary',
                                                    transition: 'color 0.2s ease',
                                                    '&:hover': {
                                                        color: primaryColor,
                                                        bgcolor: alpha(primaryColor, 0.08),
                                                    },
                                                    '&:focus-visible': {
                                                        outline: `2px solid ${primaryColor}`,
                                                        outlineOffset: 2,
                                                    },
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: '#FAFAFA',
                                    transition: 'all 0.2s ease',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.32)',
                                        borderWidth: 1.5,
                                    },
                                    '&:hover': {
                                        bgcolor: '#F5F5F5',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: primaryColor,
                                            borderWidth: 2,
                                        },
                                    },
                                    '&.Mui-focused': {
                                        bgcolor: '#FFFFFF',
                                        boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.2)}`,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: primaryColor,
                                            borderWidth: 2,
                                        },
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        opacity: 0.7,
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(0, 0, 0, 0.7)',
                                    fontWeight: 500,
                                    '&.Mui-focused': {
                                        color: primaryColor,
                                        fontWeight: 600,
                                    },
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleLogin}
                            disabled={isLoading || !isFormValid}
                            aria-busy={isLoading}
                            sx={{
                                mt: 4,
                                py: 1.75,
                                borderRadius: 2,
                                fontWeight: 700,
                                fontSize: '1.0625rem',
                                letterSpacing: '0.02em',
                                textTransform: 'none',
                                bgcolor: primaryColor,
                                color: '#FFFFFF',
                                boxShadow: `0 4px 14px ${alpha(primaryColor, 0.4)}`,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: alpha(primaryColor, 0.9),
                                    boxShadow: `0 6px 20px ${alpha(primaryColor, 0.5)}`,
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    boxShadow: `0 2px 8px ${alpha(primaryColor, 0.4)}`,
                                },
                                '&:focus-visible': {
                                    outline: `3px solid ${primaryColor}`,
                                    outlineOffset: 2,
                                },
                                '&.Mui-disabled': {
                                    bgcolor: '#E0E0E0',
                                    color: '#9E9E9E',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {isLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                                    <span>Entrando...</span>
                                </Box>
                            ) : (
                                'Acessar sistema'
                            )}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 4,
                            color: 'rgba(0, 0, 0, 0.54)',
                        }}
                    >
                        Detail Flow <br />
                        Sistema de gestão para estética automotiva
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginForm;
