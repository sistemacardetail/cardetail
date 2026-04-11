import React, { useCallback } from 'react';
import { DateSelectArg, DatesSetArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { alpha, Box, Stack, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import dayjs from 'dayjs';
import ConfirmDialog from '../../components/ConfirmDialog';
import { AgendamentoCalendarioDTO } from '../../agendamentos';

interface UseCalendarHandlersProps {
    onAgendamentoClick?: (agendamento: AgendamentoCalendarioDTO) => void;
    onDateSelect?: (start: Date, end: Date) => void;
    onDayClick?: (date: Date) => void;
    onDayClickForNewAgendamento?: (date: Date) => void;
    onAgendamentoDrop?: (id: string, start: Date, end: Date) => void;
    onDatesChange?: (start: Date, end: Date) => void;
    onDayViewDateChange?: (date: Date) => void;
    selectedDate?: Date;
    calendarRef: React.RefObject<any>;
    previousViewRef: React.MutableRefObject<string>;
    dialogs: any;
}

export function useCalendarHandlers({
    onAgendamentoClick,
    onDateSelect,
    onDayClick,
    onDayClickForNewAgendamento,
    onAgendamentoDrop,
    onDatesChange,
    onDayViewDateChange,
    selectedDate,
    calendarRef,
    previousViewRef,
    dialogs,
}: UseCalendarHandlersProps) {
    const handleEventClick = useCallback(
        (info: EventClickArg) => {
            if (onAgendamentoClick) {
                const agendamento = info.event.extendedProps as AgendamentoCalendarioDTO;
                onAgendamentoClick({
                    ...agendamento,
                    id: info.event.id,
                    dataHoraInicio: info.event.startStr,
                    dataHoraFim: info.event.endStr,
                });
            }
        },
        [onAgendamentoClick]
    );

    const confirmAgendamentoChange = useCallback(
        async (numero: number, start: Date, end: Date, messagePrefix: string) => {
            const novaData = dayjs(start).format('DD/MM/YYYY');
            const novaHoraInicio = dayjs(start).format('HH:mm');
            const novaHoraFim = dayjs(end).format('HH:mm');

            return dialogs.open(ConfirmDialog, {
                title: 'Atualizar agendamento',
                message: React.createElement(Stack, { spacing: 1.5 },
                    React.createElement(Typography, { variant: 'body2', color: 'text.secondary' },
                        `${messagePrefix} `,
                        React.createElement('strong', null, `#${numero}`)
                    ),
                    React.createElement(Box, {
                        sx: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: alpha('#1976d2', 0.08),
                            borderRadius: 2,
                            border: `1px solid ${alpha('#1976d2', 0.2)}`
                        }
                    },
                        React.createElement(ScheduleIcon, { fontSize: 'small', color: 'primary' }),
                        React.createElement(Typography, { variant: 'body2', fontWeight: 600 },
                            `${novaData} das ${novaHoraInicio} às ${novaHoraFim}`
                        )
                    )
                ),
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                confirmColor: 'primary',
            });
        },
        [dialogs]
    );

    const handleEventResize = useCallback(
        async (info: any) => {
            if (onAgendamentoDrop && info.event.start && info.event.end) {
                const numero = info.event.extendedProps.numero;
                const confirmed = await confirmAgendamentoChange(
                    numero,
                    info.event.start,
                    info.event.end,
                    'Novo período para o agendamento'
                );

                if (confirmed) {
                    onAgendamentoDrop(info.event.id, info.event.start, info.event.end);
                } else {
                    info.revert();
                }
            }
        },
        [onAgendamentoDrop, confirmAgendamentoChange]
    );

    const handleDateSelect = useCallback(
        (info: DateSelectArg) => {
            const viewType = info.view.type;
            if (viewType !== 'dayGridMonth' && onDateSelect) {
                onDateSelect(info.start, info.end);
            } else if (onDayClick) {
                onDayClick(info.start);
            }
        },
        [onDateSelect, onDayClick]
    );

    const handleDateClick = useCallback(
        (info: DateClickArg) => {
            const viewType = info.view.type;
            if (viewType !== 'dayGridMonth' && onDayClickForNewAgendamento) {
                onDayClickForNewAgendamento(info.date);
            } else if (onDayClick) {
                onDayClick(info.date);
            }
        },
        [onDayClick, onDayClickForNewAgendamento]
    );

    const handleEventDrop = useCallback(
        async (info: EventDropArg) => {
            if (onAgendamentoDrop && info.event.start && info.event.end) {
                const numero = info.event.extendedProps.numero;
                const confirmed = await confirmAgendamentoChange(
                    numero,
                    info.event.start,
                    info.event.end,
                    'Novo horário para o agendamento'
                );

                if (confirmed) {
                    onAgendamentoDrop(info.event.id, info.event.start, info.event.end);
                } else {
                    info.revert();
                }
            }
        },
        [onAgendamentoDrop, confirmAgendamentoChange]
    );

    const handleDatesSet = useCallback(
        (dateInfo: DatesSetArg) => {
            const previousView = previousViewRef.current;
            const currentView = dateInfo.view.type;
            const isChangingToDay = previousView !== 'timeGridDay' && currentView === 'timeGridDay';

            if (isChangingToDay && selectedDate && calendarRef.current) {
                calendarRef.current.getApi().gotoDate(selectedDate);
            }

            if (onDatesChange) onDatesChange(dateInfo.start, dateInfo.end);
            if (currentView === 'timeGridDay' && onDayViewDateChange) onDayViewDateChange(dateInfo.start);

            previousViewRef.current = currentView;
        },
        [onDatesChange, onDayViewDateChange, selectedDate, calendarRef, previousViewRef]
    );

    return {
        handleEventClick,
        handleEventResize,
        handleDateSelect,
        handleDateClick,
        handleEventDrop,
        handleDatesSet,
    };
}
