import React, { useCallback, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { DateSelectArg, DatesSetArg, EventClickArg, EventContentArg, EventDropArg } from '@fullcalendar/core';
import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { AgendamentoCalendarioDTO, AgendamentoStatus } from '../agendamentos';
import { getAgendamentoStatusHexColor } from '../utils';
import { useDialogs } from '../hooks/useDialogs';
import ConfirmDialog from '../components/ConfirmDialog';
import EventCardTimeGrid from './calendar/EventCardTimeGrid';

dayjs.locale('pt-br');

interface FullCalendarViewProps {
    agendamentos: AgendamentoCalendarioDTO[];
    initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
    initialDate?: Date;
    selectedDate?: Date;
    onAgendamentoClick?: (agendamento: AgendamentoCalendarioDTO) => void;
    onDateSelect?: (start: Date, end: Date) => void;
    onDayClick?: (date: Date) => void;
    onAgendamentoDrop?: (id: string, start: Date, end: Date) => void;
    onDatesChange?: (start: Date, end: Date) => void;
    onDayViewDateChange?: (date: Date) => void;
    onViewStateChange?: (viewType: string, date: Date) => void;
    onTodayClick?: () => void;
    loading?: boolean;
}

function renderEventContent(eventInfo: EventContentArg) {
    const status = eventInfo.event.extendedProps.status as AgendamentoStatus;
    const numero = eventInfo.event.extendedProps.numero;
    const clienteNome = eventInfo.event.extendedProps.clienteNome ?? '';
    const infoVeiculo = !!eventInfo.event.extendedProps.veiculoModelo
        ? eventInfo.event.extendedProps.veiculoModelo + ' ' + eventInfo.event.extendedProps.veiculoCor
        : '';
    const placa = eventInfo.event.extendedProps.veiculoPlaca ?? '';
    const servicosNome = (eventInfo.event.extendedProps.servicosNome ?? []) as string[];
    const color = getAgendamentoStatusHexColor(status);
    const view = eventInfo.view.type;
    const isMultiDay = eventInfo.event.extendedProps.isMultiDay;
    const isCancelled = status === 'CANCELADO';

    if (isMultiDay && (view === 'timeGridWeek' || view === 'timeGridDay')) {
        const originalStart = eventInfo.event.extendedProps.originalStart;
        const originalEnd = eventInfo.event.extendedProps.originalEnd;
        const startStr = originalStart ? dayjs(originalStart).format('DD/MM') : '';
        const endStr = originalEnd ? dayjs(originalEnd).format('DD/MM') : '';

        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    px: 1,
                    py: 0.25,
                    borderRadius: '6px',
                    bgcolor: isCancelled ? alpha(color, 0.08) : alpha(color, 0.15),
                    border: `1px solid ${isCancelled ? alpha(color, 0.3) : color}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                        bgcolor: alpha(color, 0.25),
                        boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
                    },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: isCancelled ? 'text.disabled' : color,
                        whiteSpace: 'nowrap',
                        textDecoration: isCancelled ? 'line-through' : 'none',
                    }}
                >
                    {startStr} - {endStr}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        color: isCancelled ? 'text.disabled' : 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: isCancelled ? 'line-through' : 'none',
                    }}
                >
                    {numero ? `#${numero} · ` : ''}{eventInfo.event.title}
                </Typography>
            </Box>
        );
    }

    if (view === 'dayGridMonth') {
        return (
            <Box
                sx={{
                    width: '100%',
                    px: 0.75,
                    py: 0.4,
                    borderRadius: '6px',
                    bgcolor: isCancelled ? alpha(color, 0.1) : alpha(color, 0.16),
                    borderLeft: `4px solid ${isCancelled ? alpha(color, 0.4) : color}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isCancelled ? 0.85 : 0.95,
                    '&:hover': {
                        bgcolor: alpha(color, 0.22),
                        transform: 'translateX(2px)',
                    },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        color: isCancelled ? 'text.disabled' : 'text.primary',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.4,
                        textDecoration: isCancelled ? 'line-through' : 'none',
                    }}
                >
                    {eventInfo.timeText && (
                        <Box
                            component="span"
                            sx={{
                                mr: 0.5,
                                color: isCancelled ? alpha(color, 0.6) : color,
                                fontWeight: 700,
                                fontSize: '0.65rem',
                            }}
                        >
                            {eventInfo.timeText}
                        </Box>
                    )}
                    {numero ? `#${numero} · ` : ''}{eventInfo.event.title}
                </Typography>
            </Box>
        );
    }

    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    const durationMinutes = start && end
        ? (end.getTime() - start.getTime()) / 60000
        : 60;

    const startDate = isMultiDay && start ? dayjs(start).format('DD/MM') : undefined;
    const endDate = isMultiDay && end ? dayjs(end).format('DD/MM') : undefined;

    return (
        <EventCardTimeGrid
            timeText={eventInfo.timeText}
            title={eventInfo.event.title}
            numero={numero}
            status={status}
            color={color}
            servicosNome={servicosNome}
            clienteNome={clienteNome}
            veiculoInfo={infoVeiculo}
            placa={placa}
            durationMinutes={durationMinutes}
            isMultiDay={isMultiDay}
            startDate={startDate}
            endDate={endDate}
        />
    );
}

export default function FullCalendarView({
    agendamentos,
    initialView = 'dayGridMonth',
    initialDate,
    selectedDate,
    onAgendamentoClick,
    onDateSelect,
    onDayClick,
    onAgendamentoDrop,
    onDatesChange,
    onDayViewDateChange,
    onViewStateChange,
    onTodayClick,
    loading = false,
}: FullCalendarViewProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const dialogs = useDialogs();
    const previousViewRef = useRef<string>('dayGridMonth');
    const isDraggingRef = useRef<boolean>(false);
    const [customTitle, setCustomTitle] = useState<string>('');

    const events = React.useMemo(() => {
        const result: any[] = [];

        agendamentos.forEach((ag) => {
            const statusColor = getAgendamentoStatusHexColor(ag.status);

            const start = dayjs(ag.dataHoraInicio);
            const end = dayjs(ag.dataHoraFim);

            const isMultiDay = !start.isSame(end, 'day');

            if (isMultiDay) {

                const startDay = start.startOf('day');
                const endDay = end.subtract(1, 'minute').startOf('day');

                result.push({
                    id: ag.id,
                    groupId: ag.id,

                    title: ag.titulo || ag.pacoteNome,

                    start: startDay.format('YYYY-MM-DD'),
                    end: endDay.add(1, 'day').format('YYYY-MM-DD'),

                    allDay: true,

                    backgroundColor: alpha(statusColor, 0.1),
                    borderColor: statusColor,
                    textColor: '#333',

                    extendedProps: {
                        ...ag,
                        isMultiDay: true,
                        originalStart: ag.dataHoraInicio,
                        originalEnd: ag.dataHoraFim,
                    },
                });

            } else {

                result.push({
                    id: ag.id,
                    groupId: ag.id,

                    title: ag.titulo || ag.pacoteNome,

                    start: ag.dataHoraInicio,
                    end: ag.dataHoraFim,

                    backgroundColor: alpha(statusColor, 0.2),
                    borderColor: statusColor,
                    textColor: '#333',

                    allDay: false,

                    extendedProps: {
                        ...ag,
                        isMultiDay: false,
                    },
                });

            }

        });

        return result;

    }, [agendamentos]);

    const handleEventClick = useCallback(
        (info: EventClickArg) => {
            if (onAgendamentoClick) {
                const agendamento = info.event.extendedProps as AgendamentoCalendarioDTO & {
                    originalStart?: string;
                    originalEnd?: string;
                };
                const dataHoraInicio = agendamento.originalStart || info.event.startStr;
                const dataHoraFim = agendamento.originalEnd || info.event.endStr;

                onAgendamentoClick({
                    ...agendamento,
                    id: info.event.id,
                    dataHoraInicio,
                    dataHoraFim,
                });
            }
        },
        [onAgendamentoClick]
    );

    const handleEventResize = useCallback(
        async (info: any) => {
            if (onAgendamentoDrop && info.event.start && info.event.end) {
                const numero = info.event.extendedProps.numero;
                const isAllDay = info.event.allDay;
                const start = dayjs(info.event.start);
                const end = isAllDay ? dayjs(info.event.end).subtract(1, 'day') : dayjs(info.event.end);
                const isMultiDay = !start.isSame(end, 'day');

                const periodoTexto = isMultiDay
                    ? `${start.format('DD/MM/YYYY')} até ${end.format('DD/MM/YYYY')}`
                    : `${start.format('DD/MM/YYYY')} das ${start.format('HH:mm')} às ${end.format('HH:mm')}`;

                const confirmed = await dialogs.open(ConfirmDialog, {
                    title: 'Atualizar agendamento',
                    message: (
                        <Stack spacing={1.5}>
                            <Typography variant="body2" color="text.secondary">
                                Novo período para o agendamento <strong>#{numero}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: alpha('#1976d2', 0.08), borderRadius: 2, border: `1px solid ${alpha('#1976d2', 0.2)}` }}>
                                <ScheduleIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight={600}>
                                    {periodoTexto}
                                </Typography>
                            </Box>
                        </Stack>
                    ),
                    confirmText: 'Confirmar',
                    cancelText: 'Cancelar',
                    confirmColor: 'primary',
                });

                if (confirmed) {
                    const finalEnd = isAllDay ? end.toDate() : info.event.end;
                    onAgendamentoDrop(info.event.id, info.event.start, finalEnd);
                } else {
                    info.revert();
                }
            }
        },
        [onAgendamentoDrop, dialogs]
    );

    const handleDateSelect = useCallback(
        async (info: DateSelectArg) => {
            const viewType = info.view.type;
            if (viewType !== 'dayGridMonth' && onDateSelect) {
                let finalStart: Date;
                let finalEnd: Date;

                if (info.allDay) {
                    finalStart = dayjs(info.start).hour(9).minute(0).second(0).toDate();
                    finalEnd = dayjs(info.end).subtract(1, 'day').hour(18).minute(0).second(0).toDate();
                } else {
                    finalStart = info.start;
                    finalEnd = info.end;
                }

                const start = dayjs(finalStart);
                const end = dayjs(finalEnd);
                const isMultiDay = !start.isSame(end, 'day');

                const periodoTexto = isMultiDay
                    ? `${start.format('DD/MM/YYYY HH:mm')} até ${end.format('DD/MM/YYYY HH:mm')}`
                    : `${start.format('DD/MM/YYYY')} das ${start.format('HH:mm')} às ${end.format('HH:mm')}`;

                const confirmed = await dialogs.open(ConfirmDialog, {
                    title: 'Novo agendamento',
                    message: (
                        <Stack spacing={1.5}>
                            <Typography variant="body2" color="text.secondary">
                                Deseja criar um agendamento para o período selecionado?
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: alpha('#1976d2', 0.08), borderRadius: 2, border: `1px solid ${alpha('#1976d2', 0.2)}` }}>
                                <ScheduleIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight={600}>
                                    {periodoTexto}
                                </Typography>
                            </Box>
                        </Stack>
                    ),
                    confirmText: 'Confirmar',
                    cancelText: 'Cancelar',
                    confirmColor: 'primary',
                });

                if (confirmed) {
                    onDateSelect(finalStart, finalEnd);
                }
            } else if (onDayClick) {
                onDayClick(info.start);
            }
        },
        [onDateSelect, onDayClick, dialogs]
    );

    const handleDateClick = useCallback(
        (info: DateClickArg) => {
            const viewType = info.view.type;
            if (viewType === 'dayGridMonth' && onDayClick) {
                onDayClick(info.date);
            }
        },
        [onDayClick]
    );

    const handleEventDrop = useCallback(
        async (info: EventDropArg) => {
            if (onAgendamentoDrop && info.event.start && info.event.end) {
                const numero = info.event.extendedProps.numero;
                const isAllDay = info.event.allDay;
                const start = dayjs(info.event.start);
                const end = isAllDay ? dayjs(info.event.end).subtract(1, 'day') : dayjs(info.event.end);
                const isMultiDay = !start.isSame(end, 'day');

                const periodoTexto = isMultiDay
                    ? `${start.format('DD/MM/YYYY')} até ${end.format('DD/MM/YYYY')}`
                    : `${start.format('DD/MM/YYYY')} das ${start.format('HH:mm')} às ${end.format('HH:mm')}`;

                const confirmed = await dialogs.open(ConfirmDialog, {
                    title: 'Atualizar agendamento',
                    message: (
                        <Stack spacing={1.5}>
                            <Typography variant="body2" color="text.secondary">
                                {isMultiDay ? 'Novo período' : 'Novo horário'} para o agendamento <strong>#{numero}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: alpha('#1976d2', 0.08), borderRadius: 2, border: `1px solid ${alpha('#1976d2', 0.2)}` }}>
                                <ScheduleIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight={600}>
                                    {periodoTexto}
                                </Typography>
                            </Box>
                        </Stack>
                    ),
                    confirmText: 'Confirmar',
                    cancelText: 'Cancelar',
                    confirmColor: 'primary',
                });

                if (confirmed) {
                    const finalEnd = isAllDay ? end.toDate() : info.event.end;
                    onAgendamentoDrop(info.event.id, info.event.start, finalEnd);
                } else {
                    info.revert();
                }
            }
        },
        [onAgendamentoDrop, dialogs]
    );

    const formatCalendarTitle = useCallback((viewType: string, start: Date, end: Date): string => {
        if (viewType === 'dayGridMonth') {
            const d = dayjs(start);
            const mes = d.format('MMMM');
            return mes.charAt(0).toUpperCase() + mes.slice(1) + ' de ' + d.format('YYYY');
        }
        if (viewType === 'timeGridWeek') {
            const s = dayjs(start);
            const e = dayjs(end).subtract(1, 'day');
            const mes = e.format('MMMM');
            return `${s.format('D')} – ${e.format('D')} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}. de ${e.format('YYYY')}`;
        }
        if (viewType === 'timeGridDay') {
            const d = dayjs(start);
            const mes = d.format('MMMM');
            return `${d.format('D')} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${d.format('YYYY')}`;
        }
        return '';
    }, []);

    const handleDatesSet = useCallback(
        (dateInfo: DatesSetArg) => {
            const previousView = previousViewRef.current;
            const viewType = dateInfo.view.type;
            const isChangingToDay = previousView !== 'timeGridDay' && viewType === 'timeGridDay';
            const isChangingToWeek = previousView !== 'timeGridWeek' && viewType === 'timeGridWeek';

            if ((isChangingToDay || isChangingToWeek) && selectedDate && calendarRef.current) {
                const currentDate = dayjs(dateInfo.view.calendar.getDate());
                const targetDate = dayjs(selectedDate);
                if (!currentDate.isSame(targetDate, 'day')) {
                    calendarRef.current.getApi().gotoDate(selectedDate);
                    previousViewRef.current = viewType;
                    return;
                }
            }

            if (onDatesChange) onDatesChange(dateInfo.start, dateInfo.end);
            if (viewType === 'timeGridDay' && onDayViewDateChange) onDayViewDateChange(dateInfo.start);
            onViewStateChange?.(viewType, dateInfo.view.calendar.getDate());

            setCustomTitle(formatCalendarTitle(viewType, dateInfo.start, dateInfo.end));

            previousViewRef.current = viewType;
        },
        [onDatesChange, onDayViewDateChange, onViewStateChange, selectedDate, formatCalendarTitle]
    );

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',

                '& .fc': { height: '100%', fontFamily: 'inherit' },

                '& .fc-toolbar': {
                    padding: '12px 20px',
                    marginBottom: 0,
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #ebebeb',
                },
                '& .fc-toolbar-title': {
                    fontSize: '0',
                    visibility: 'hidden',
                    '&::after': {
                        content: `"${customTitle}"`,
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: (theme: any) => theme.palette.primary.main,
                        visibility: 'visible',
                    },
                },

                '& .fc-button': {
                    backgroundColor: '#fff',
                    borderColor: (theme: any) => alpha(theme.palette.primary.main, 0.3),
                    color: (theme: any) => theme.palette.primary.main,
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    padding: '5px 14px',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                        backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
                        borderColor: (theme: any) => theme.palette.primary.main,
                    },
                    '&:focus': { boxShadow: 'none' },
                    '&.fc-button-active': {
                        backgroundColor: (theme: any) => theme.palette.primary.main,
                        borderColor: (theme: any) => theme.palette.primary.main,
                        color: '#fff',
                        boxShadow: (theme: any) => `0 2px 6px ${alpha(theme.palette.primary.main, 0.35)}`,
                    },
                },
                '& .fc-button-group .fc-button': {
                    borderRadius: 0,
                    '&:first-of-type': { borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
                    '&:last-of-type': { borderTopRightRadius: '8px', borderBottomRightRadius: '8px' },
                },
                '& .fc-prev-button, & .fc-next-button': { padding: '5px 9px' },

                '& .fc-col-header-cell': {
                    backgroundColor: '#fafafa',
                    padding: '10px 0',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    borderBottom: '1px solid #ebebeb',
                },

                '& .fc-daygrid-day.fc-day-today': { backgroundColor: 'transparent' },
                '& .fc-timegrid-col.fc-day-today': { backgroundColor: 'transparent' },
                '& .fc-day-today .fc-daygrid-day-number': {
                    backgroundColor: (theme: any) => theme.palette.primary.main,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px',
                },
                '& .fc-col-header-cell.fc-day-today': {
                    '& .fc-col-header-cell-cushion': {
                        color: (theme: any) => theme.palette.primary.main,
                        fontWeight: 700,
                    },
                },
                '& .fc-daygrid-day-number': {
                    padding: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#444',
                },

                '& .fc-daygrid-event': {
                    borderRadius: '6px',
                    padding: 0,
                    margin: '1px 3px',
                    border: 'none',
                    backgroundColor: 'transparent',
                },
                '& .fc-daygrid-event-harness': { marginTop: '2px' },
                '& .fc-daygrid-more-link': {
                    fontSize: '0.72rem',
                    color: (theme: any) => theme.palette.primary.main,
                    fontWeight: 600,
                    padding: '2px 6px',
                },

                '& .fc-timegrid-axis-frame': {
                    justifyContent: 'center',
                },
                '& .fc-daygrid-body': {
                    cursor: 'pointer',
                },
                '& .fc-daygrid-day-frame': {
                    minHeight: '28px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha('#1976d2', 0.04),
                    },
                },
                '& .fc-daygrid-day-events': {
                    marginTop: '2px',
                },

                '& .fc-timegrid-slot': {
                    borderColor: alpha('#000', 0.05),
                    height: '48px',
                },
                '& .fc-timegrid-slot-label': {
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#999',
                    paddingRight: '8px',
                },
                '& .fc-timegrid-axis': {
                    backgroundColor: '#fafafa',
                    borderRight: '1px solid #ebebeb',
                },

                '& .fc-timegrid-event-harness': {
                    paddingRight: '3px',
                    marginTop: '1px',
                    marginBottom: '1px',
                },
                '& .fc-timegrid-event': {
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0 !important',
                    marginRight: '3px',
                    marginTop: '1px !important',
                    marginBottom: '1px !important',
                },
                '& .fc-timegrid-event .fc-event-main': {
                    padding: 0,
                    height: '100%',
                },

                '& .fc-timegrid-now-indicator-line': {
                    borderColor: alpha('#1976d2', 0.4),
                    borderWidth: '1px',
                },
                '& .fc-timegrid-now-indicator-arrow': {
                    borderColor: alpha('#1976d2', 0.4),
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    width: '6px',
                    height: '6px',
                },

                '& .fc-scrollgrid': { borderColor: '#ebebeb' },
                '& .fc-scrollgrid td, & .fc-scrollgrid th': { borderColor: '#ebebeb' },

                '& .fc-highlight': { backgroundColor: alpha('#1976d2', 0.1), borderRadius: '6px' },

                '& .fc-popover': {
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    border: '1px solid #ebebeb',
                },
                '& .fc-popover-header': { padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem' },
                '& .fc-popover-body': { padding: '8px', maxHeight: '280px', overflowY: 'auto' },

                '& .fc-daygrid-day:hover': { backgroundColor: alpha('#1976d2', 0.02) },
                '& .fc-timegrid-col:hover': { backgroundColor: alpha('#1976d2', 0.02) },
                '& .fc-event': { cursor: 'pointer' },

                '& .fc-event-dragging': {
                    opacity: '1 !important',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18) !important',
                    zIndex: '999 !important',
                    transform: 'scale(1.02)',
                },
                '& .fc-event-mirror': {
                    opacity: '0.75 !important',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15) !important',
                },
            }}
        >
            {loading && (
                <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '16px' }}>
                    <Typography color="text.secondary" fontWeight={500}>Carregando...</Typography>
                </Box>
            )}

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                nextDayThreshold="08:00:00"
                initialView={initialView}
                initialDate={initialDate ?? selectedDate}
                headerToolbar={{
                    left: 'prev,next customToday',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                customButtons={{
                    customToday: {
                        text: 'Hoje',
                        click: () => {
                            calendarRef.current?.getApi().today();
                            onTodayClick?.();
                        },
                    },
                }}
                locale="pt-br"
                buttonText={{ month: 'Mês', week: 'Semana', day: 'Dia' }}
                events={events}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                selectable={!!onDateSelect}
                selectMirror={true}
                select={handleDateSelect}
                dateClick={handleDateClick}
                editable={!!onAgendamentoDrop}
                eventAllow={(dropInfo, draggedEvent) => {
                    if (draggedEvent?.allDay) {
                        return dropInfo.allDay;
                    }
                    return !dropInfo.allDay;
                }}
                eventDrop={handleEventDrop}
                datesSet={handleDatesSet}
                eventResize={handleEventResize}
                moreLinkClick="popover"
                dayMaxEvents={3}
                moreLinkText={(num) => `+${num} mais`}
                allDaySlot={true}
                allDayText=""
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                nowIndicator={true}
                height="100%"
                weekends={true}
                firstDay={0}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotEventOverlap={false}
                eventOverlap={() => isDraggingRef.current}
                eventMaxStack={6}
                expandRows={true}
                snapDuration="00:30:00"
                eventMinWidth={60}
                eventDidMount={(info) => {
                    info.el.title = 'Clique para editar este agendamento';
                    info.el.style.cursor = 'pointer';
                    info.el.style.border = 'none';
                    info.el.style.background = 'transparent';
                    info.el.style.padding = '2px';
                }}
                eventDragStart={(info) => {
                    isDraggingRef.current = true;
                    document.querySelectorAll('.fc-timegrid-event-harness').forEach((el) => {
                        const harness = el as HTMLElement;
                        const eventEl = harness.querySelector('.fc-event') as HTMLElement | null;
                        if (eventEl && !eventEl.classList.contains('fc-event-dragging')) {
                            harness.style.opacity = '0.25';
                            harness.style.pointerEvents = 'none';
                        }
                    });
                    if (info.el) {
                        info.el.style.zIndex = '999';
                        info.el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                        info.el.style.opacity = '1';
                    }
                }}
                eventDragStop={(info) => {
                    isDraggingRef.current = false;
                    document.querySelectorAll('.fc-timegrid-event-harness').forEach((el) => {
                        const harness = el as HTMLElement;
                        harness.style.opacity = '';
                        harness.style.pointerEvents = '';
                    });
                    if (info.el) {
                        info.el.style.zIndex = '';
                        info.el.style.boxShadow = '';
                    }
                }}
                slotLaneDidMount={(arg) => {
                    const isTimeGrid = arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay';
                    if (!isTimeGrid) return;
                    arg.el.title = 'Clique para criar novo agendamento';
                    arg.el.style.cursor = 'pointer';
                }}
                dayHeaderContent={(arg) => {
                    if (arg.view.type === 'timeGridDay') {
                        const diaSemana = dayjs(arg.date).format('dddd');
                        return (
                            <span style={{ textTransform: 'capitalize' }}>
                                {diaSemana}
                            </span>
                        );
                    }
                    if (arg.view.type === 'timeGridWeek') {
                        return (
                            <Box
                                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, transition: 'color 0.15s' }}
                                onClick={() => {
                                    onDayClick?.(arg.date);
                                }}
                            >
                                {arg.text}
                            </Box>
                        );
                    }
                    return arg.text;
                }}
            />
        </Paper>
    );
}
