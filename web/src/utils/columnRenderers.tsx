import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

const getTelefoneLabel = (row: any): string | null => {
    const rawTelefone =
        row?.clienteTelefone
        ?? row?.cliente?.telefonePrincipal
        ?? row?.cliente?.telefoneContato
        ?? row?.telefoneContato
        ?? row?.telefonePrincipal;

    if (rawTelefone && typeof rawTelefone === 'string') {
        return rawTelefone;
    }

    const telefones = row?.cliente?.telefones;
    if (Array.isArray(telefones) && telefones.length > 0) {
        const principal = telefones.find((t: any) => t?.principal) ?? telefones[0];
        const telefone = principal?.telefone ?? principal;
        const ddd = telefone?.ddd;
        const numero = telefone?.numero;
        if (numero) {
            return ddd ? `(${ddd}) ${numero}` : numero;
        }
    }

    return null;
};

export const renderClienteCell = (params: GridRenderCellParams) => {
    const row = params.row as any;
    const nome = params.value ?? row?.clienteNome ?? row?.cliente?.nome ?? '-';
    const telefone = getTelefoneLabel(row);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={500}>
                {nome || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {telefone || '-'}
            </Typography>
        </Box>
    );
};

export const renderVeiculoCell = (params: GridRenderCellParams) => {
    const veiculo = params.value;
    if (!veiculo) return '-';
    const descricao = `${veiculo.modelo?.marca?.nome ?? ''} ${veiculo.modelo?.nome ?? ''} ${veiculo.cor?.nome ?? ''}`.trim();
    const placa = veiculo?.placa || 'Sem placa';
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={500}>
                {descricao || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {placa}
            </Typography>
        </Box>
    );
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
