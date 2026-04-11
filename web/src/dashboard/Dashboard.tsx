import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import FullCalendarView from './FullCalendarView';
import DayScheduleList from './DayScheduleList';
import QuickActions from '../agendamentos/QuickActions';
import { AgendamentoCalendarioDTO, searchAgendamentosCalendario, updateAgendamentoDatas, } from '../agendamentos';
import { useNotifications } from '../hooks/useNotifications';
import { PERMISSOES, useAuth } from '../contexts/AuthContext';

dayjs.locale('pt-br');

const AUTO_REFRESH_INTERVAL = 300000;
const DASHBOARD_CALENDAR_STATE_KEY = 'dashboard_calendar_state';

type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface DashboardCalendarState {
    viewType: CalendarViewType;
    calendarDateISO: string;
    selectedDateISO: string;
    hideCancelled: boolean;
}

function readCalendarState(): DashboardCalendarState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(DASHBOARD_CALENDAR_STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as DashboardCalendarState;
        if (!parsed?.viewType || !parsed?.calendarDateISO || !parsed?.selectedDateISO) return null;
        return parsed;
    } catch {
        return null;
    }
}

export default function Dashboard() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { hasPermissao } = useAuth();

    const canView = hasPermissao(PERMISSOES.AGENDAMENTOS_VISUALIZAR);
    const canEdit = hasPermissao(PERMISSOES.AGENDAMENTOS_EDITAR);

    const cachedCalendarState = readCalendarState();
    const initialCalendarDate = cachedCalendarState?.calendarDateISO ? dayjs(cachedCalendarState.calendarDateISO) : dayjs();
    const initialSelectedDate = cachedCalendarState?.selectedDateISO ? dayjs(cachedCalendarState.selectedDateISO) : initialCalendarDate;
    const [selectedDate, setSelectedDate] = useState<Dayjs>(initialSelectedDate);
    const [calendarDate, setCalendarDate] = useState<Dayjs>(initialCalendarDate);
    const [calendarView, setCalendarView] = useState<CalendarViewType>(cachedCalendarState?.viewType ?? 'dayGridMonth');
    const [agendamentos, setAgendamentos] = useState<AgendamentoCalendarioDTO[]>([]);
    const [hideCancelled, setHideCancelled] = useState<boolean>(cachedCalendarState?.hideCancelled ?? false);
    const [loading, setLoading] = useState(false);
    const [calendarDates, setCalendarDates] = useState<{ start: Date; end: Date } | null>(null);

    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isRefreshingRef = useRef(false);

    // Carregar agendamentos do periodo
    const loadAgendamentos = useCallback(async (silent = false) => {
        if (!calendarDates || !canView) return;

        if (isRefreshingRef.current) return;
            isRefreshingRef.current = true;

        if (!silent) {
            setLoading(true);
        }

        try {
            const dataInicio = dayjs(calendarDates.start).format('YYYY-MM-DD');
            const dataFim = dayjs(calendarDates.end).format('YYYY-MM-DD');

            const { data, error } = await searchAgendamentosCalendario(dataInicio, dataFim);

            if (error) {
                if (!silent) {
                    notifications.show({ message: error, severity: 'error' });
                }
            } else if (data) {
                setAgendamentos(data);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
            isRefreshingRef.current = false;
        }
    }, [calendarDates, notifications, canView]);

    useEffect(() => {
        loadAgendamentos();
    }, [loadAgendamentos]);

    useEffect(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        refreshIntervalRef.current = setInterval(() => {
            loadAgendamentos(true);
        }, AUTO_REFRESH_INTERVAL);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [loadAgendamentos]);

    // Quando o calendario muda as datas visiveis
    const handleDatesChange = useCallback((start: Date, end: Date) => {
        setCalendarDates({ start, end });
    }, []);

    // Selecao de data para novo agendamento (arrastar para selecionar periodo)
    const handleDateSelect = useCallback((start: Date, end: Date) => {
        const startDay = dayjs(start);
        setSelectedDate(startDay);
        setCalendarDate(startDay);
        const startDate = dayjs(start);
        const endDate = dayjs(end);

        const dataInicio = startDate.format('YYYY-MM-DDTHH:mm:ss');
        const dataFim = endDate.format('YYYY-MM-DDTHH:mm:ss');

        const url = `/app/agendamentos/novo?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
        navigate(url, { state: { from: '/app' } });
    }, [navigate]);

    // Clique em um dia (apenas seleciona o dia no painel lateral)
    const handleDayClick = useCallback((date: Date) => {
        const selectedDay = dayjs(date);
        setSelectedDate(selectedDay);
        setCalendarDate(selectedDay);
    }, []);

    // Quando a view diária muda de data, atualiza o DaySchedule
    const handleDayViewDateChange = useCallback((date: Date) => {
        const selectedDay = dayjs(date);
        setSelectedDate(selectedDay);
        setCalendarDate(selectedDay);
    }, []);

    const handleTodayClick = useCallback(() => {
        const now = dayjs();
        setSelectedDate(now);
        setCalendarDate(now);
    }, []);

    const handleViewStateChange = useCallback((viewType: string, date: Date) => {
        const normalizedView = viewType as CalendarViewType;
        setCalendarView(normalizedView);
        setCalendarDate(dayjs(date));
    }, []);

    // Drag & drop de agendamento
    const handleAgendamentoDrop = useCallback(async (id: string, start: Date, end: Date) => {
        if (!canEdit) {
            notifications.show({ message: 'Você não tem permissão para editar agendamentos.', severity: 'error' });
            loadAgendamentos();
            return;
        }

        const dataInicio = dayjs(start).format('YYYY-MM-DDTHH:mm:ss');
        const dataFim = dayjs(end).format('YYYY-MM-DDTHH:mm:ss');

        const { error } = await updateAgendamentoDatas(id, dataInicio, dataFim);

        if (error) {
            notifications.show({ message: error, severity: 'error' });
            // Recarregar para reverter a mudanca visual
            loadAgendamentos();
        } else {
            notifications.show({ message: 'Agendamento atualizado!', severity: 'success' });

            loadAgendamentos(true);
        }
    }, [loadAgendamentos, notifications, canEdit]);

    // Novo agendamento
    const handleNewAgendamento = useCallback(() => {
        const dataInicio = selectedDate.hour(8).minute(0).format('YYYY-MM-DDTHH:mm:ss');
        navigate(`/app/agendamentos/novo?dataInicio=${dataInicio}&dataFim=${dataInicio}`, { state: { from: '/app' } });
    }, [navigate, selectedDate]);

    const handleEditFull = useCallback((id: string) => {
        navigate(`/app/agendamentos/${id}`, { state: { from: '/app' } });
    }, [navigate]);

    // Clique em um agendamento
    const handleAgendamentoClick = useCallback((agendamento: AgendamentoCalendarioDTO) => {
        handleEditFull(agendamento.id);
    }, [handleEditFull]);

    const agendamentosVisiveis = useMemo(() => {
        if (!hideCancelled) return agendamentos;
        return agendamentos.filter((ag) => ag.status !== 'CANCELADO');
    }, [agendamentos, hideCancelled]);
    const hasCancelledAgendamentos = useMemo(
        () => agendamentos.some((ag) => ag.status === 'CANCELADO'),
        [agendamentos]
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(
            DASHBOARD_CALENDAR_STATE_KEY,
            JSON.stringify({
                viewType: calendarView,
                calendarDateISO: calendarDate.toISOString(),
                selectedDateISO: selectedDate.toISOString(),
                hideCancelled,
            } satisfies DashboardCalendarState)
        );
    }, [calendarView, calendarDate, selectedDate, hideCancelled]);

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
                <QuickActions onNewAgendamento={handleNewAgendamento} />
            </Box>

            <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                {/* AGENDAMENTOS DO DIA */}
                <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
                    <Box sx={{ height: '100%' }}>
                        <DayScheduleList
                            selectedDate={selectedDate}
                            agendamentos={agendamentosVisiveis}
                            onAgendamentoClick={handleAgendamentoClick}
                            onNewAgendamento={handleNewAgendamento}
                            loading={loading}
                            hideCancelled={hideCancelled}
                            onHideCancelledChange={setHideCancelled}
                            showHideCancelledControl={hasCancelledAgendamentos}
                        />
                    </Box>
                </Grid>

                {/* CALENDARIO */}
                <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
                    <Box sx={{ height: '100%' }}>
                        <FullCalendarView
                            agendamentos={agendamentosVisiveis}
                            initialView={calendarView}
                            initialDate={calendarDate.toDate()}
                            selectedDate={selectedDate.toDate()}
                            onAgendamentoClick={handleAgendamentoClick}
                            onDateSelect={handleDateSelect}
                            onDayClick={handleDayClick}
                            onAgendamentoDrop={handleAgendamentoDrop}
                            onDatesChange={handleDatesChange}
                            onDayViewDateChange={handleDayViewDateChange}
                            onViewStateChange={handleViewStateChange}
                            onTodayClick={handleTodayClick}
                            loading={loading}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
