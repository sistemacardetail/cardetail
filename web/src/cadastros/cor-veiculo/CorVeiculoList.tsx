import React from 'react';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../../components/crud';
import { CorVeiculoDTO, deleteCorVeiculo, searchCoresVeiculos } from './CorVeiculoService';
import { Palette } from '@mui/icons-material';
import { FilterableField } from '../../utils/rsql.utils';
import { PERMISSOES } from '../../contexts/AuthContext';

const columns: GridColDef[] = [
    {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'nome',
        headerName: 'Nome',
    },
];

const defaultSort: GridSortModel = [
    { field: 'nome', sort: 'asc' },
];

const permissions={
    visualizar: PERMISSOES.CADASTROS_VISUALIZAR,
    criar: PERMISSOES.CADASTROS_GERENCIAR,
    editar: PERMISSOES.CADASTROS_GERENCIAR,
    excluir: PERMISSOES.CADASTROS_GERENCIAR,
};

export default function CorVeiculoList() {
    return (
        <CrudList<CorVeiculoDTO>
            title="Cores de Veículos"
            basePath="/app/cadastros/cores"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchCoresVeiculos}
            deleteFn={deleteCorVeiculo}
            getDeleteItemName={(item) => item.nome}
            entityName="a cor"
            defaultSort={defaultSort}
            icon={<Palette />}
            permissions={permissions}
        />
    );
}
