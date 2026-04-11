import React from 'react';
import { Box, Card, CircularProgress, Grid, Stack, Tooltip, Typography, } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Check } from '@mui/icons-material';
import PageContainer from '../../components/PageContainer';
import { AVAILABLE_COLORS, useThemeContext } from '../../contexts/ThemeContext';
import { PERMISSOES } from '../../contexts/AuthContext';
import { PermissionPageGuard } from '../../components/PermissionGuard';
import PaletteIcon from '@mui/icons-material/Palette';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: 'divider',
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
        >
            {icon}
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
        </Stack>
    );
}

export default function SistemaForm() {
    const { primaryColor, setPrimaryColor, isLoading } = useThemeContext();

    const handleColorSelect = (color: string) => {
        setPrimaryColor(color);
    };

    return (
        <PermissionPageGuard permissao={PERMISSOES.CONFIGURACAO_SISTEMA_GERENCIAR}>
            <PageContainer
                breadcrumbs={[
                    { title: 'Configurações', path: '/app/configuracoes' },
                    { title: 'Sistema' },
                ]}
            >
                <Stack spacing={3}>
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
                            icon={<PaletteIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Aparência"
                        />
                        <Stack spacing={3} sx={{ p: 3 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Selecione a cor principal do sistema:
                                </Typography>

                                <Grid container spacing={2}>
                                    {AVAILABLE_COLORS.map((color) => (
                                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={color.value}>
                                            <Tooltip title={color.name} arrow>
                                                <Box
                                                    onClick={() => handleColorSelect(color.value)}
                                                    sx={{
                                                        position: 'relative',
                                                        height: 80,
                                                        borderRadius: 2,
                                                        bgcolor: color.value,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        border: 3,
                                                        borderColor: primaryColor === color.value
                                                            ? 'white'
                                                            : 'transparent',
                                                        boxShadow: primaryColor === color.value
                                                            ? `0 0 0 3px ${color.value}, 0 4px 12px ${alpha(color.value, 0.4)}`
                                                            : `0 2px 8px ${alpha(color.value, 0.3)}`,
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: `0 4px 16px ${alpha(color.value, 0.5)}`,
                                                        },
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {primaryColor === color.value && (
                                                        <Check
                                                            sx={{
                                                                color: 'white',
                                                                fontSize: 32,
                                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Tooltip>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    textAlign: 'center',
                                                    mt: 1,
                                                    fontWeight: primaryColor === color.value ? 600 : 400,
                                                    color: primaryColor === color.value ? 'primary.main' : 'text.secondary',
                                                }}
                                            >
                                                {color.name}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    border: 1,
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    {isLoading && <CircularProgress size={16} />}
                                    <Typography variant="body2" color="text.secondary">
                                        {isLoading
                                            ? 'Salvando configuração...'
                                            : 'A cor selecionada será aplicada em todo o sistema, incluindo menus, botões e elementos de destaque. A alteração é salva automaticamente.'}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Card>
                </Stack>
            </PageContainer>
        </PermissionPageGuard>
    );
}
