import type { AgendamentoStatus, StatusPagamento } from '../agendamentos';
import type { OrcamentoStatus } from '../orcamentos';

interface StatusConfig {
    label: string;
    color: string;
}

export const agendamentoStatusConfig: Record<AgendamentoStatus, StatusConfig> = {
    CONFIRMADO: { label: 'Confirmado', color: '#2196f3' },
    EM_ANDAMENTO: { label: 'Em Andamento', color: '#9c27b0' },
    CONCLUIDO: { label: 'Concluído', color: '#4caf50' },
    CANCELADO: { label: 'Cancelado', color: '#f44336' },
};

export const statusPagamentoConfig: Record<StatusPagamento, StatusConfig> = {
    PENDENTE: { label: 'Pendente', color: '#ff9800' },
    PARCIAL: { label: 'Parcialmente Pago', color: '#2196f3' },
    PAGO: { label: 'Pago', color: '#4caf50' },
};

export const orcamentoStatusConfig: Record<OrcamentoStatus, StatusConfig> = {
    PENDENTE: { label: 'Pendente', color: '#ff9800' },
    AGENDADO: { label: 'Agendado', color: '#4caf50' },
    CANCELADO: { label: 'Cancelado', color: '#f44336' },
};

export const getAgendamentoStatusColor = (status: AgendamentoStatus): string => {
    return agendamentoStatusConfig[status]?.color ?? '#9e9e9e';
};

export const getAgendamentoStatusHexColor = getAgendamentoStatusColor;

export const getAgendamentoStatusLabel = (status: AgendamentoStatus): string => {
    return agendamentoStatusConfig[status]?.label ?? status;
};

export const getOrcamentoStatusColor = (status: OrcamentoStatus): string => {
    return orcamentoStatusConfig[status]?.color ?? '#9e9e9e';
};

export const getOrcamentoStatusLabel = (status: OrcamentoStatus): string => {
    return orcamentoStatusConfig[status]?.label ?? status;
};

export const getStatusPagamentoColor = (status: StatusPagamento): string => {
    return statusPagamentoConfig[status]?.color ?? '#9e9e9e';
};

export const getStatusPagamentoLabel = (status: StatusPagamento): string => {
    return statusPagamentoConfig[status]?.label ?? status;
};
