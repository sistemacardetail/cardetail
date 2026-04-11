import { alpha } from '@mui/material';
import { EventInput } from '@fullcalendar/core';
import { getAgendamentoStatusHexColor } from '../../utils';
import { AgendamentoCalendarioDTO } from '../../agendamentos';

export interface CalendarEvent extends EventInput {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: AgendamentoCalendarioDTO;
}

export function mapAgendamentosToEvents(agendamentos: AgendamentoCalendarioDTO[]): CalendarEvent[] {
    return agendamentos.map((ag) => {
        const statusColor = getAgendamentoStatusHexColor(ag.status);
        return {
            id: ag.id,
            title: ag.titulo || ag.pacoteNome || '',
            start: ag.dataHoraInicio,
            end: ag.dataHoraFim,
            backgroundColor: alpha(statusColor, 0.1),
            borderColor: statusColor,
            textColor: '#333',
            extendedProps: { ...ag },
        };
    });
}

export function calculateEventDuration(start: Date | null, end: Date | null): number {
    if (!start || !end) return 60;
    return (end.getTime() - start.getTime()) / 60000;
}

export function getVeiculoInfo(veiculoModelo?: string, veiculoCor?: string): string {
    if (!veiculoModelo) return '';
    return `${veiculoModelo} ${veiculoCor || ''}`.trim();
}

export const calendarConfig = {
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    snapDuration: '00:30:00',
    dayMaxEvents: 3,
    eventMinWidth: 60,
    eventMaxStack: 6,
};

export const calendarLocale = {
    locale: 'pt-br',
    buttonText: {
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia'
    },
    moreLinkText: (num: number) => `+${num} mais`,
};

export const calendarTimeFormat = {
    eventTimeFormat: { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false },
    slotLabelFormat: { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false },
};
