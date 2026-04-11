import React from 'react';
import { alpha, Box, Card, CardContent, Grid, Tooltip, Typography } from '@mui/material';
import { Assessment, Event, MonetizationOn, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';
import { checkPermission } from '../components/crud/CrudList';

interface QuickActionsProps {
    onNewAgendamento?: () => void;
}

export default function QuickActions({ onNewAgendamento }: QuickActionsProps) {
    const navigate = useNavigate();
    const { hasPermissao } = useAuth();

    const canCreateAgendamento = checkPermission(PERMISSOES.AGENDAMENTOS_CRIAR, hasPermissao);
    const canCreateCliente = checkPermission(PERMISSOES.CLIENTES_CRIAR, hasPermissao);
    const canCreateOrcamento = checkPermission(PERMISSOES.ORCAMENTOS_CRIAR, hasPermissao);

    const actions = [
        {
            title: 'Agendamento',
            description: 'Agendar serviço',
            icon: <Event sx={{ fontSize: 32 }} />,
            color: '#1976d2',
            onClick: onNewAgendamento || (() => navigate('/app/agendamentos/novo', { state: { from: '/app' } })),
            disabled: !canCreateAgendamento,
        },
        {
            title: 'Cliente',
            description: 'Cadastrar cliente',
            icon: <PersonAdd sx={{ fontSize: 32 }} />,
            color: '#2e7d32',
            onClick: () => navigate('/app/clientes/novo', { state: { from: '/app' } }),
            disabled: !canCreateCliente,
        },
        {
            title: 'Orçamento',
            description: 'Criar orçamento',
            icon: <MonetizationOn sx={{ fontSize: 32 }} />,
            color: '#ed6c02',
            onClick: () => navigate('/app/orcamentos/novo', { state: { from: '/app' } }),
            disabled: !canCreateOrcamento,
        },
        {
            title: 'Faturamento',
            description: 'Acessar dados de faturamento',
            icon: <Assessment sx={{ fontSize: 32 }} />,
            color: '#9c27b0',
            onClick: () => navigate('/app'),
        },
    ];

    return (
        <Box>
            <Grid container spacing={2}>
                {actions.map((action, index) => (
                    <Grid key={index} size={{ xs: 6, sm: 3 }}>
                        <Tooltip
                            title={action?.disabled ? 'Usuário não possui permissão' : ''}
                            arrow
                        >
                            <span>
                                <Card
                                    elevation={0}
                                    onClick={action?.disabled ? undefined : action.onClick}
                                    sx={{
                                        cursor: action?.disabled ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'all 0.25s ease',
                                        opacity: action?.disabled ? 0.6 : 1,
                                        pointerEvents: action?.disabled ? 'none' : 'auto',
                                        ...( !action?.disabled && {
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                borderColor: action.color,
                                                boxShadow: `0 4px 16px ${alpha(action.color, 0.2)}`,
                                                bgcolor: alpha(action.color, 0.03),
                                            }
                                        }),
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 6,
                                            alignSelf: 'stretch',
                                            bgcolor: action.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            py: 2.5,
                                            px: 2.5,
                                            '&:last-child': { pb: 2.5 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: alpha(action.color, 0.08),
                                                color: action.color,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {action.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                                {action.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {action.description}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </span>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
