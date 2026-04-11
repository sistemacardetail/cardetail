import React from 'react';
import { Box, Chip } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

export const renderVeiculoCell = (params: GridRenderCellParams) => {
    const veiculo = params.value;
    if (!veiculo) return '-';
    return `${veiculo.modelo?.marca?.nome} ${veiculo.modelo?.nome} [${veiculo?.placa ?? 'sem placa'}]`;
};

export const renderPacoteCell = (params: GridRenderCellParams) => {
    return params.value?.nome ?? '';
};

export const renderCurrencyCell = (params: GridRenderCellParams) => {
    return formatCurrency(params.value ?? 0);
};

export const renderDateTimeCell = (params: GridRenderCellParams) => {
    return formatDateTime(params.value);
};

export const renderDateCell = (params: GridRenderCellParams) => {
    return formatDate(params.value);
};

export const renderServicosCell = (params: GridRenderCellParams) => {
    const servicos = params.value;
    if (!servicos || servicos.length === 0) {
        return (
            <Box
                sx={{
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                }}
            >
                Nenhum serviço adicionado
            </Box>
        );
    }
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                alignItems: 'center',
                py: 1,
            }}
        >
            {servicos.map((item: any, index: number) => (
                <Chip
                    key={index}
                    label={item.servico?.nome}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                />
            ))}
        </Box>
    );
};

interface StatusChipProps {
    label: string;
    color: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';
}

export const renderStatusChip = ({ label, color }: StatusChipProps) => (
    <Chip label={label} color={color} size="small" />
);
