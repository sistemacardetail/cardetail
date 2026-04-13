import { Box, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import StatusChip from '../components/StatusChip';
import { AgendamentoListDTO, deleteAgendamento, searchAgendamentos } from './AgendamentoService';
import {
    agendamentoStatusConfig,
    formatDate,
    formatTime,
    getStatusPagamentoColor,
    getStatusPagamentoLabel,
    renderClienteCell,
    renderCurrencyCell,
    renderPacoteCell,
    renderServicosCell,
    renderVeiculoCell,
    statusPagamentoConfig,
} from '../utils';
import { FilterableField } from '../utils/rsql.utils';
import { CalendarMonth } from '@mui/icons-material';
import { PERMISSOES } from '../contexts/AuthContext';
import React from 'react';

const defaultSort: GridSortModel = [
    { field: 'numero', sort: 'desc' },
];

const columns: GridColDef[] = [
    {
        field: 'numero',
        headerName: 'Número',
        width: 90,
    },
    {
        field: 'clienteNome',
        headerName: 'Cliente',
        width: 150,
        sortable: false,
        renderCell: renderClienteCell,
    },
    {
        field: 'veiculo',
        headerName: 'Veículo',
        width: 250,
        sortable: false,
        renderCell: renderVeiculoCell,
    },
    {
        field: 'pacote',
        headerName: 'Pacote',
        width: 200,
        sortable: false,
        renderCell: renderPacoteCell,
    },
    {
        field: 'servicos',
        headerName: 'Serviços',
        flex: 1,
        minWidth: 300,
        sortable: false,
        renderCell: renderServicosCell,
    },
    {
        field: 'valorFinal',
        headerName: 'Valor',
        width: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AgendamentoListDTO>) => {
            const statusPag = params.row.statusPagamento || 'PENDENTE';
            const color = getStatusPagamentoColor(statusPag);
            const isPago = statusPag === 'PAGO';

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: isPago ? 'success.main' : 'text.primary',
                        }}
                    >
                        {renderCurrencyCell(params)}
                    </Typography>
                    <Chip
                        size="small"
                        label={getStatusPagamentoLabel(statusPag)}
                        sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: alpha(color, 0.12),
                            color: color,
                            border: 'none',
                            '& .MuiChip-icon': {
                                fontSize: '0.8rem',
                                color: 'inherit',
                                ml: 0.5,
                            },
                            '& .MuiChip-label': {
                                px: 0.75,
                            },
                        }}
                    />
                </Box>
            );
        },
    },
    {
        field: 'dataPrevisaoInicio',
        headerName: 'Data',
        width: 190,
        renderCell: (params: GridRenderCellParams<AgendamentoListDTO>) => {
            const inicio = params.row.dataPrevisaoInicio;
            const fim = params.row.dataPrevisaoFim;
            if (!inicio) return '-';
            return `${formatDate(inicio)} ${formatTime(inicio)} - ${formatTime(fim)}`;
        },
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 130,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AgendamentoListDTO>) => (
            <StatusChip type="agendamento" status={params.value} />
        ),
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'numero',
        headerName: 'Número',
        type: 'number',
    },
    {
        field: 'veiculo.cliente.nome',
        headerName: 'Cliente',
    },
    {
        field: 'veiculo.modelo.nome',
        headerName: 'Modelo Veículo',
    },
    {
        field: 'veiculo.placa',
        headerName: 'Placa',
    },
    {
        field: 'pacote.nome',
        headerName: 'Pacote',
    },
    {
        field: 'servicos.servico.nome',
        headerName: 'Serviço',
    },
    {
        field: 'dataPrevisaoInicio',
        headerName: 'Data',
        type: 'dateDay',
    },
    {
        field: 'orcamento.numero',
        headerName: 'Número Orçamento',
        type: 'number',
    },
    {
        field: 'status',
        headerName: 'Status',
        type: 'enum',
        enumOptions: Object.entries(agendamentoStatusConfig).map(([value, config]) => ({
            value,
            label: config.label,
        })),
    },
    {
        field: 'statusPagamento',
        headerName: 'Status Pagamento',
        type: 'enum',
        enumOptions: Object.entries(statusPagamentoConfig).map(([value, config]) => ({
            value,
            label: config.label,
        })),
    },
];

const permissions = {
    visualizar: PERMISSOES.AGENDAMENTOS_VISUALIZAR,
    criar: PERMISSOES.AGENDAMENTOS_CRIAR,
    editar: PERMISSOES.AGENDAMENTOS_EDITAR,
    excluir: PERMISSOES.AGENDAMENTOS_EXCLUIR,
};

export default function AgendamentoList() {
    return (
        <CrudList<AgendamentoListDTO>
            title="Agendamentos"
            basePath="/app/agendamentos"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchAgendamentos}
            deleteFn={deleteAgendamento}
            getDeleteItemName={(item) => `número ${item.numero}`}
            entityName="o agendamento"
            icon={<CalendarMonth />}
            defaultSort={defaultSort}
            permissions={permissions}
        />
    );
}
