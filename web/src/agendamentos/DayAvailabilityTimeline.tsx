import React, { useCallback, useEffect, useState } from 'react';
import { alpha, Box, Chip, CircularProgress, Paper, Tooltip, Typography, } from '@mui/material';
import { Event } from '@mui/icons-material';
import dayjs from 'dayjs';
import { AgendamentoCalendarioDTO, searchAgendamentosCalendario } from './AgendamentoService';

interface TimeSlot {
    time: string; // "HH:mm"
    agendamentosCount: number; // quantidade de check-ins neste horário
    agendamentos: AgendamentoCalendarioDTO[]; // agendamentos que iniciam neste slot
}

interface DayAvailabilityTimelineProps {
    selectedDate: string | undefined; // formato "YYYY-MM-DDTHH:mm" ou "YYYY-MM-DD"
    onTimeSelect?: (time: string) => void; // retorna "YYYY-MM-DDTHH:mm"
    startHour?: number;
    endHour?: number;
    intervalMinutes?: number;
    excludeAgendamentoId?: string; // para excluir o próprio agendamento ao editar
}

// Cores dos status
const STATUS_COLORS = {
    free: '#4caf50',      // Verde - livre
    hasCheckin: '#ff9800', // Laranja - com check-in
};

export default function DayAvailabilityTimeline({
    selectedDate,
    onTimeSelect,
    startHour = 8,
    endHour = 18,
    intervalMinutes = 30,
    excludeAgendamentoId,
}: DayAvailabilityTimelineProps) {
    const [agendamentos, setAgendamentos] = useState<AgendamentoCalendarioDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState<TimeSlot[]>([]);

    const dateOnly = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

    // Buscar agendamentos do dia
    const loadAgendamentos = useCallback(async () => {
        if (!dateOnly) {
            setAgendamentos([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await searchAgendamentosCalendario(dateOnly, dateOnly);
            if (data) {
                const filtered = data.filter(ag =>
                    ag.status !== 'CANCELADO' &&
                    ag.id !== excludeAgendamentoId
                );
                setAgendamentos(filtered);
            } else if (error) {
                console.error('Erro ao buscar agendamentos:', error);
                setAgendamentos([]);
            }
        } finally {
            setLoading(false);
        }
    }, [dateOnly, excludeAgendamentoId]);

    useEffect(() => {
        loadAgendamentos();
    }, [loadAgendamentos]);

    // Gerar slots e contar agendamentos em cada horário
    useEffect(() => {
        if (!dateOnly) {
            setSlots([]);
            return;
        }

        const newSlots: TimeSlot[] = [];
        const baseDate = dayjs(dateOnly);

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += intervalMinutes) {
                const slotTime = baseDate.hour(hour).minute(minute);
                const slotStart = slotTime.toDate().getTime();
                const slotEnd = slotTime.add(intervalMinutes, 'minute').toDate().getTime();

                // Encontrar agendamentos que INICIAM neste slot (check-in)
                const slotAgendamentos = agendamentos.filter(ag => {
                    const agStart = dayjs(ag.dataHoraInicio).toDate().getTime();
                    return agStart >= slotStart && agStart < slotEnd;
                });

                newSlots.push({
                    time: slotTime.format('HH:mm'),
                    agendamentosCount: slotAgendamentos.length,
                    agendamentos: slotAgendamentos,
                });
            }
        }

        setSlots(newSlots);
    }, [dateOnly, agendamentos, startHour, endHour, intervalMinutes]);

    const handleSlotClick = useCallback((slot: TimeSlot) => {
        if (onTimeSelect && dateOnly) {
            const fullDateTime = `${dateOnly}T${slot.time}`;
            onTimeSelect(fullDateTime);
        }
    }, [onTimeSelect, dateOnly]);

    if (!selectedDate) {
        return null;
    }

    const totalAgendamentos = agendamentos.length;

    // Função para obter estilo baseado no status
    const getSlotStyle = (slot: TimeSlot) => {
        const hasCheckin = slot.agendamentosCount > 0;
        const color = hasCheckin ? STATUS_COLORS.hasCheckin : STATUS_COLORS.free;

        return {
            bgcolor: alpha(color, 0.12),
            color: color,
            borderColor: alpha(color, 0.4),
            cursor: 'pointer',
        };
    };

    const getTooltipContent = (slot: TimeSlot) => {
        if (slot.agendamentosCount === 0) {
            return (
                <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ color: STATUS_COLORS.free }}>
                        Livre
                    </Typography>
                    <Typography variant="caption" display="block" color="text.primary">
                        Clique para selecionar
                    </Typography>
                </Box>
            );
        }

        const agNames = slot.agendamentos
            .map(ag => `• ${ag.clienteNome} - ${ag.veiculoModelo} ${ag.veiculoPlaca} (${
                dayjs(ag.dataHoraInicio).format('HH:mm')} - ${dayjs(ag.dataHoraFim).format('HH:mm')})`)
            .join('\n');

        return (
            <Box>
                <Typography variant="caption" fontWeight={600} sx={{ color: STATUS_COLORS.hasCheckin }}>
                    {slot.agendamentosCount} agendamento{slot.agendamentosCount > 1 ? 's' : ''}
                </Typography>
                <Typography variant="caption" component="pre" display="block" sx={{ m: 0, mt: 0.5, fontFamily: 'inherit', whiteSpace: 'pre-line' }}>
                    {agNames}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Clique para selecionar
                </Typography>
            </Box>
        );
    };

    return (
        <Paper
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: alpha('#1976d2', 0.03),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                        Agendamentos do dia
                    </Typography>
                </Box>
                {loading ? (
                    <CircularProgress size={16} />
                ) : (
                    <Chip
                        icon={<Event sx={{ fontSize: 14 }} />}
                        label={`${totalAgendamentos} agendamento${totalAgendamentos === 1 ? '' : 's'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 24, '& .MuiChip-label': { px: 1 } }}
                    />
                )}
            </Box>

            {/* Slots */}
            <Box sx={{ p: 1.5, maxHeight: 200, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {slots.map((slot) => {
                        const style = getSlotStyle(slot);
                        const hasCheckin = slot.agendamentosCount > 0;
                        const color = hasCheckin ? STATUS_COLORS.hasCheckin : STATUS_COLORS.free;

                        return (
                            <Tooltip
                                key={slot.time}
                                title={getTooltipContent(slot)}
                                arrow
                                placement="top"
                                slotProps={{
                                    tooltip: {
                                        sx: {
                                            maxWidth: 500,
                                            whiteSpace: 'pre-line',
                                        },
                                    },
                                }}
                            >
                                <Box
                                    onClick={() => handleSlotClick(slot)}
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        border: 1,
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        ...style,
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 1,
                                            borderColor: color,
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: 'inherit',
                                        }}
                                    >
                                        {slot.time}
                                    </Typography>
                                    {hasCheckin && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
                                                width: 14,
                                                height: 14,
                                                borderRadius: '50%',
                                                bgcolor: STATUS_COLORS.hasCheckin,
                                                color: 'white',
                                                fontSize: '0.6rem',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {slot.agendamentosCount}
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </Box>

            {/* Legenda */}
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(STATUS_COLORS.free, 0.4),
                            border: 1,
                            borderColor: alpha(STATUS_COLORS.free, 0.6),
                        }}
                    />
                    <span>Livre</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: alpha(STATUS_COLORS.hasCheckin, 0.4),
                            border: 1,
                            borderColor: alpha(STATUS_COLORS.hasCheckin, 0.6),
                        }}
                    />
                    <span>Horários com início de agendamento</span>
                </Box>
            </Box>
        </Paper>
    );
}
