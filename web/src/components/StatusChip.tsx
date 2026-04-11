import { Chip, ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AgendamentoStatus, StatusPagamento } from '../agendamentos';
import { OrcamentoStatus } from '../orcamentos';
import {
    getAgendamentoStatusColor,
    getAgendamentoStatusLabel,
    getOrcamentoStatusColor,
    getOrcamentoStatusLabel,
    getStatusPagamentoColor,
    getStatusPagamentoLabel,
} from '../utils';
import React from 'react';

type StatusType = 'agendamento' | 'orcamento' | 'pagamento';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
    type: StatusType;
    status: AgendamentoStatus | OrcamentoStatus | StatusPagamento | null | undefined;
}

const getStatusConfig = (type: StatusType, status: string | null | undefined) => {
    if (!status) {
        return { label: 'Novo', color: '#9e9e9e' };
    }

    if (type === 'agendamento') {
        return {
            label: getAgendamentoStatusLabel(status as AgendamentoStatus),
            color: getAgendamentoStatusColor(status as AgendamentoStatus),
        };
    }

    if (type === 'pagamento') {
        return {
            label: getStatusPagamentoLabel(status as StatusPagamento),
            color: getStatusPagamentoColor(status as StatusPagamento),
        };
    }

    return {
        label: getOrcamentoStatusLabel(status as OrcamentoStatus),
        color: getOrcamentoStatusColor(status as OrcamentoStatus),
    };
};

export default function StatusChip({ type, status, size = 'small', sx, ...props }: Readonly<StatusChipProps>) {
    const { label, color } = getStatusConfig(type, status);

    return (
        <Chip
            label={label}
            size={size}
            sx={{
                fontWeight: 500,
                fontSize: '0.75rem',
                color: color,
                borderColor: color,
                bgcolor: alpha(color, 0.1),
                border: 1,
                ...sx,
            }}
            {...props}
        />
    );
}
