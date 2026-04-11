import React, { useEffect, useRef } from 'react';
import {
    alpha,
    Box,
    capitalize,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Skeleton,
    Typography,
    useTheme,
} from '@mui/material';
import { AccessTime, DirectionsCar, Lock, Person } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { AgendamentoCalendarioDTO } from '../agendamentos';
import { getAgendamentoStatusHexColor, getAgendamentoStatusLabel } from '../utils';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';
import { CustomSwitch } from '../components/CustomSwitch';

interface DayScheduleListProps {
    selectedDate: Dayjs;
    agendamentos: AgendamentoCalendarioDTO[];
    onAgendamentoClick?: (agendamento: AgendamentoCalendarioDTO) => void;
    onNewAgendamento?: () => void;
    loading?: boolean;
    hideCancelled?: boolean;
    onHideCancelledChange?: (value: boolean) => void;
    showHideCancelledControl?: boolean;
}

const ITEM_HEIGHT = 88;

function getEventState(ag: AgendamentoCalendarioDTO): 'past' | 'current' | 'upcoming' {
    if (ag.status === 'CONCLUIDO' || ag.status === 'CANCELADO') return 'past';
    if (ag.status === 'EM_ANDAMENTO') return 'current';
    const now = dayjs();
    const end = dayjs(ag.dataHoraFim);
    if (now.isAfter(end)) return 'past';
    return 'upcoming';
}

export default function DayScheduleList({
                                            selectedDate,
                                            agendamentos,
                                            onAgendamentoClick,
                                            loading = false,
                                            hideCancelled = false,
                                            onHideCancelledChange,
                                            showHideCancelledControl = false,
                                        }: DayScheduleListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentItemRef = useRef<HTMLLIElement>(null);
    const { hasPermissao } = useAuth();
    const canView = hasPermissao(PERMISSOES.AGENDAMENTOS_VISUALIZAR);

    const dayAgendamentos = agendamentos
        .filter((ag) => {
            const start = dayjs(ag.dataHoraInicio);
            const end = dayjs(ag.dataHoraFim);
            // Inclui agendamentos que começam no dia OU que passam pelo dia (multi-dia)
            return start.isSame(selectedDate, 'day') ||
                (start.isBefore(selectedDate, 'day') && end.isAfter(selectedDate, 'day')) ||
                end.isSame(selectedDate, 'day');
        })
        .sort((a, b) => dayjs(a.dataHoraInicio).diff(dayjs(b.dataHoraInicio)));

    const isToday = selectedDate.isSame(dayjs(), 'day');

    const focusIndex = (() => {
        if (!isToday) return 0;
        const currentIdx = dayAgendamentos.findIndex((ag) => getEventState(ag) === 'current');
        if (currentIdx >= 0) return currentIdx;
        const upcomingIdx = dayAgendamentos.findIndex((ag) => getEventState(ag) === 'upcoming');
        if (upcomingIdx >= 0) return upcomingIdx;
        return dayAgendamentos.length - 1;
    })();

    useEffect(() => {
        if (!scrollRef.current || dayAgendamentos.length === 0) return;
        const timer = setTimeout(() => {
            currentItemRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 120);
        return () => clearTimeout(timer);
    }, [selectedDate, dayAgendamentos.length]);

    const diaSemana = selectedDate.format('dddd');
    const dia = selectedDate.format('DD');
    const mes = selectedDate.format('MMMM');
    const ano = selectedDate.format('YYYY');
    const dateFormatted = `${capitalize(diaSemana)}, ${dia} de ${capitalize(mes)} de ${ano}`;

    const maxVisibleItems = 7;
    const listMaxHeight = ITEM_HEIGHT * maxVisibleItems;

    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#fafafa',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>
                        Agendamentos do dia
                    </Typography>
                    {!loading && dayAgendamentos.length > 0 && (
                        <Chip
                            label={`total: ${dayAgendamentos.length}`}
                            size="small"
                            sx={{
                                fontSize: '0.68rem',
                                height: 20,
                                fontWeight: 700,
                                bgcolor: primaryColor,
                                color: '#FFFFFF',
                                '& .MuiChip-label': { px: 1 },
                            }}
                        />
                    )}
                </Box>
                <Typography variant="caption" sx={{ mt: 0.25, display: 'block', fontSize: '0.72rem', color: '#555' }}>
                    {dateFormatted}
                </Typography>
                {showHideCancelledControl && (
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CustomSwitch
                            checked={hideCancelled}
                            onChange={(event) => onHideCancelledChange?.(event.target.checked)}
                            sx={{
                                m: 0,
                                transform: 'scale(0.82)',
                                transformOrigin: 'left center',
                            }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                            Ocultar cancelados
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box
                ref={scrollRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: listMaxHeight,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha('#1976d2', 0.2),
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: alpha('#1976d2', 0.4),
                    },
                }}
            >
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i} sx={{ mb: 1.5 }}>
                                <Skeleton variant="rectangular" height={72} sx={{ borderRadius: '10px' }} />
                            </Box>
                        ))}
                    </Box>
                ) : !canView ? (
                    <Box
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            color: 'text.secondary',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Lock sx={{ fontSize: 40, opacity: 0.25 }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            Sem permissão para visualizar agendamentos
                        </Typography>
                    </Box>
                ) : dayAgendamentos.length === 0 ? (
                    <Box
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            color: 'text.secondary',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <AccessTime sx={{ fontSize: 40, opacity: 0.25 }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            Nenhum agendamento para este dia
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {dayAgendamentos.map((ag, index) => {
                            const statusColor = getAgendamentoStatusHexColor(ag.status);
                            const statusLabel = getAgendamentoStatusLabel(ag.status);
                            const state = isToday ? getEventState(ag) : 'upcoming';
                            const isCurrent = state === 'current';
                            const isPast = state === 'past';
                            const isFocused = index === focusIndex;
                            const start = dayjs(ag.dataHoraInicio);
                            const end = dayjs(ag.dataHoraFim);
                            const isMultiDay = !start.isSame(end, 'day');

                            return (
                                <React.Fragment key={ag.id}>
                                    {index > 0 && (
                                        <Divider sx={{ borderColor: alpha('#000', 0.05) }} />
                                    )}
                                    <ListItem
                                        ref={isFocused ? currentItemRef : undefined}
                                        onClick={() => onAgendamentoClick?.(ag)}
                                        sx={{
                                            cursor: 'pointer',
                                            px: 2,
                                            py: 1.25,
                                            borderLeft: `4px solid ${statusColor}`,
                                            position: 'relative',
                                            opacity: isPast ? 0.55 : 1,
                                            bgcolor: isCurrent
                                                ? alpha(statusColor, 0.06)
                                                : 'transparent',
                                            transition: 'background-color 0.2s, opacity 0.2s',
                                            '&:hover': {
                                                bgcolor: alpha(statusColor, 0.1),
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        {ag.status === 'EM_ANDAMENTO' && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        bgcolor: statusColor,
                                                        animation: 'pulse 1.5s ease-in-out infinite',
                                                        '@keyframes pulse': {
                                                            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                                            '50%': { opacity: 0.5, transform: 'scale(1.4)' },
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        <ListItemText
                                            disableTypography
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                                    <AccessTime sx={{ fontSize: 14, color: statusColor }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ fontWeight: 700, color: statusColor, fontSize: '0.72rem' }}
                                                    >
                                                        {isMultiDay
                                                            ? `${start.format('DD/MM HH:mm')} – ${end.format('DD/MM HH:mm')}`
                                                            : `${start.format('HH:mm')} – ${end.format('HH:mm')}`
                                                        }
                                                    </Typography>
                                                    <Chip
                                                        label={statusLabel}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.6rem',
                                                            height: 16,
                                                            bgcolor: alpha(statusColor, 0.12),
                                                            color: statusColor,
                                                            fontWeight: 700,
                                                            '& .MuiChip-label': { px: 0.75 },
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    {ag.titulo?.trim() !== '' && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                color: isPast ? 'text.secondary' : 'text.primary',
                                                                mb: 0.25,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            #{ag.numero} · {ag.titulo}
                                                        </Typography>
                                                    )}
                                                    {ag.servicosNome?.length > 0 && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontSize: '0.68rem',
                                                                color: '#555',
                                                                display: 'block',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {ag.servicosNome.join(' · ')}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                        {ag.clienteNome && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                                <Person sx={{ fontSize: 12, color: '#777' }} />
                                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555' }}>
                                                                    {ag.clienteNome}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {ag.veiculoModelo && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                                <DirectionsCar sx={{ fontSize: 12, color: '#777' }} />
                                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#555' }}>
                                                                    {ag.veiculoModelo} {ag.veiculoCor}
                                                                    {ag.veiculoPlaca ? ` · ${ag.veiculoPlaca}` : ''}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Box>

            {!loading && dayAgendamentos.length > maxVisibleItems && (
                <Box
                    sx={{
                        px: 2.5,
                        py: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        bgcolor: '#fafafa',
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#666' }}>
                        Role para ver todos os {dayAgendamentos.length} agendamentos
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
