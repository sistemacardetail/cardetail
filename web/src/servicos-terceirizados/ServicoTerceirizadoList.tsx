import React from 'react';
import { Chip, Stack } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import { FilterableField } from '../utils/rsql.utils';
import { PERMISSOES } from '../contexts/AuthContext';
import {
    deleteServicoTerceirizado,
    searchServicosTerceirizados,
    ServicoTerceirizadoListDTO
} from './ServicoTerceirizadoService';
import { NoCrash } from '@mui/icons-material';
import { formatTelefone } from '../utils';

const columns: GridColDef[] = [
    {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
    },
    {
        field: 'fornecedor',
        headerName: 'Fornecedor',
        width: 400,
        sortable: false,
        renderCell: (params) => params.value?.nome || '-',
    },
    {
        field: 'telefone',
        headerName: 'Telefone',
        minWidth: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ServicoTerceirizadoListDTO>) => {
            const telefone = params.row.fornecedor?.telefone;
            if (!telefone?.ddd && !telefone?.numero) return '-';
            return `(${telefone.ddd || ''}) ${formatTelefone(telefone.numero || '')}`;
        },
    },
    {
        field: 'tiposVeiculos',
        headerName: 'Tipos de Veículos',
        minWidth: 300,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ServicoTerceirizadoListDTO>) => (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {(params.value || []).map((item: any, index: number) => (
                    <Chip key={index} label={item?.tipo?.descricao || item} size="small" variant="outlined" />
                ))}
            </Stack>
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
        field: 'ativo',
        headerName: 'Status',
        type: 'boolean',
        enumOptions: [{value: 'true', label: 'Ativo'}, {value: 'false', label: 'Inativo'}],
    },
    {
        field: 'fornecedor.nome',
        headerName: 'Fornecedor',
    },
    {
        field: 'fornecedor.telefone.numero',
        headerName: 'Telefone',
    },
];

const defaultSort: GridSortModel = [
    { field: 'nome', sort: 'asc' },
];

const permissions={
    visualizar: PERMISSOES.SERVICOS_TERCEIRIZADOS_VISUALIZAR,
    criar: PERMISSOES.SERVICOS_TERCEIRIZADOS_CRIAR,
    editar: PERMISSOES.SERVICOS_TERCEIRIZADOS_EDITAR,
    excluir: PERMISSOES.SERVICOS_TERCEIRIZADOS_EXCLUIR,
};

export default function ServicoList() {
    return (
        <CrudList<ServicoTerceirizadoListDTO>
            title="Serviços Terceirizados"
            basePath="/app/servicos-terceirizados"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchServicosTerceirizados}
            deleteFn={deleteServicoTerceirizado}
            getDeleteItemName={(item) => item.nome}
            entityName="o serviço terceirizado"
            defaultSort={defaultSort}
            icon={<NoCrash />}
            permissions={permissions}
        />
    );
}
