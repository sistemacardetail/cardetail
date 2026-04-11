import React from 'react';
import { Chip } from '@mui/material';
import { GridActionsCellItem, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import { deletePacote, PacoteListDTO, searchPacotes } from './PacoteService';
import { ContentCopy, Diamond } from '@mui/icons-material';
import { FilterableField } from '../utils/rsql.utils';
import { useNavigate } from 'react-router';
import { PERMISSOES } from '../contexts/AuthContext';
import { formatCurrency, formatDuration } from '../utils';

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
        width: 150,
        renderCell: (params: GridRenderCellParams) => formatCurrency(params.value),
    },
    {
        field: 'tempoExecucaoMin',
        headerName: 'Tempo',
        width: 150,
        renderCell: (params: GridRenderCellParams) => formatDuration(params.value),
    },
    {
        field: 'tipoVeiculo',
        headerName: 'Tipo de Veículo',
        width: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams<PacoteListDTO>) => {
            const value = params.value;
            const label = typeof value === 'object' ? value?.descricao : value;
            return label ? <Chip label={label} size="small" variant="outlined" /> : '-';
        },
    },
    {
        field: 'ativo',
        headerName: 'Status',
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value ? 'Ativo' : 'Inativo'}
                color={params.value ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 500 }}
                variant="outlined"
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
        field: 'tipoVeiculo.descricao',
        headerName: 'Tipo de Veículo',
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
    visualizar: PERMISSOES.PACOTES_VISUALIZAR,
    criar: PERMISSOES.PACOTES_CRIAR,
    editar: PERMISSOES.PACOTES_EDITAR,
    excluir: PERMISSOES.PACOTES_EXCLUIR,
};

export default function PacoteList() {
    const navigate = useNavigate();

    const handleDuplicate = React.useCallback(
        (pacote: PacoteListDTO) => () => {
            navigate(`/app/pacotes/novo?duplicar=${pacote.id}`);
        },
        [navigate]
    );

    const extraActions = React.useCallback(
        (row: PacoteListDTO) => [
            <GridActionsCellItem
                key="duplicate-item"
                icon={<ContentCopy />}
                label="Duplicar"
                onClick={handleDuplicate(row)}
                showInMenu={false}
            />,
        ],
        [handleDuplicate]
    );

    return (
        <CrudList<PacoteListDTO>
            title="Pacotes"
            basePath="/app/pacotes"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchPacotes}
            deleteFn={deletePacote}
            getDeleteItemName={(item) => item.nome}
            entityName="o pacote"
            defaultSort={defaultSort}
            icon={<Diamond />}
            extraActions={extraActions}
            permissions={permissions}
        />
    );
}
