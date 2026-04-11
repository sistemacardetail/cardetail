import React from 'react';
import { Chip, Stack } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import { deleteServico, searchServicos, ServicoListDTO } from './ServicoService';
import { AutoAwesome } from '@mui/icons-material';
import { formatCurrency, formatDuration } from '../utils';
import { FilterableField } from '../utils/rsql.utils';
import { PERMISSOES } from '../contexts/AuthContext';

const columns: GridColDef[] = [
    {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
    },
    {
        field: 'valor',
        headerName: 'Valor',
        width: 120,
        renderCell: (params: GridRenderCellParams) => formatCurrency(params.value),
    },
    {
        field: 'tempoExecucaoMin',
        headerName: 'Tempo',
        width: 120,
        renderCell: (params: GridRenderCellParams) => formatDuration(params.value),
    },
    {
        field: 'tiposVeiculos',
        headerName: 'Tipos de Veículos',
        minWidth: 300,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ServicoListDTO>) => (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {(params.value || []).map((item: any, index: number) => (
                    <Chip key={index} label={item?.tipo?.descricao || item} size="small" variant="outlined" />
                ))}
            </Stack>
        ),
    },
    {
        field: 'disponivelAgendamento',
        headerName: 'Agendamento',
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value ? 'Sim' : 'Não'}
                color={params.value ? 'info' : 'default'}
                size="small"
                variant="outlined"
            />
        ),
    },
    {
        field: 'disponivelPacote',
        headerName: 'Pacote',
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value ? 'Sim' : 'Não'}
                color={params.value ? 'info' : 'default'}
                size="small"
                variant="outlined"
            />
        ),
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 100,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value ? 'Ativo' : 'Inativo'}
                color={params.value ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{ ml: 'auto', fontWeight: 500, fontSize: '0.75rem' }}
            />
        ),
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'nome',
        headerName: 'Nome',
    },
    {
        field: 'valor',
        headerName: 'Valor',
        type: 'number',
    },
    {
        field: 'disponivelAgendamento',
        headerName: 'Agendamento',
        type: 'boolean',
        enumOptions: [{value: 'true', label: 'Sim'}, {value: 'false', label: 'Não'}],
    },
    {
        field: 'disponivelPacote',
        headerName: 'Pacote',
        type: 'boolean',
        enumOptions: [{value: 'true', label: 'Sim'}, {value: 'false', label: 'Não'}],
    },
    {
        field: 'ativo',
        headerName: 'Status',
        type: 'boolean',
        enumOptions: [{value: 'true', label: 'Ativo'}, {value: 'false', label: 'Inativo'}],
    },
];

const defaultSort: GridSortModel = [
    { field: 'nome', sort: 'asc' },
];

const permissions={
    visualizar: PERMISSOES.SERVICOS_VISUALIZAR,
    criar: PERMISSOES.SERVICOS_CRIAR,
    editar: PERMISSOES.SERVICOS_EDITAR,
    excluir: PERMISSOES.SERVICOS_EXCLUIR,
};

export default function ServicoList() {
    return (
        <CrudList<ServicoListDTO>
            title="Serviços"
            basePath="/app/servicos"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchServicos}
            deleteFn={deleteServico}
            getDeleteItemName={(item) => item.nome}
            entityName="o serviço"
            defaultSort={defaultSort}
            icon={<AutoAwesome />}
            permissions={permissions}
        />
    );
}
