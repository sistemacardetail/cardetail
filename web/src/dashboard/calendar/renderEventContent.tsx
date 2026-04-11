import React from 'react';
import { EventContentArg } from '@fullcalendar/core';
import { getAgendamentoStatusHexColor } from '../../utils';
import { calculateEventDuration, getVeiculoInfo } from './calendarUtils';
import EventCardMonth from './EventCardMonth';
import EventCardTimeGrid from './EventCardTimeGrid';
import { AgendamentoStatus } from '../../agendamentos';

export function renderEventContent(eventInfo: EventContentArg) {
    const status = eventInfo.event.extendedProps.status as AgendamentoStatus;
    const numero = eventInfo.event.extendedProps.numero;
    const clienteNome = eventInfo.event.extendedProps.clienteNome ?? '';
    const veiculoModelo = eventInfo.event.extendedProps.veiculoModelo;
    const veiculoCor = eventInfo.event.extendedProps.veiculoCor;
    const placa = eventInfo.event.extendedProps.veiculoPlaca ?? '';
    const servicosNome = (eventInfo.event.extendedProps.servicosNome ?? []) as string[];
    const color = getAgendamentoStatusHexColor(status);
    const view = eventInfo.view.type;

    if (view === 'dayGridMonth') {
        return (
            <EventCardMonth
                timeText={eventInfo.timeText}
                title={eventInfo.event.title}
                numero={numero}
                color={color}
            />
        );
    }

    const durationMinutes = calculateEventDuration(eventInfo.event.start, eventInfo.event.end);
    const veiculoInfo = getVeiculoInfo(veiculoModelo, veiculoCor);

    return (
        <EventCardTimeGrid
            timeText={eventInfo.timeText}
            title={eventInfo.event.title}
            numero={numero}
            color={color}
            servicosNome={servicosNome}
            clienteNome={clienteNome}
            veiculoInfo={veiculoInfo}
            placa={placa}
            durationMinutes={durationMinutes}
        />
    );
}
