import React from 'react';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../../components/crud';
import { deleteTipoVeiculo, searchTiposVeiculos, TipoVeiculoDTO } from './TipoVeiculoService';
import { LocalOffer } from '@mui/icons-material';
import { FilterableField } from '../../utils/rsql.utils';
import { PERMISSOES } from '../../contexts/AuthContext';

const columns: GridColDef[] = [
    {
        field: 'descricao',
        headerName: 'Descrição',
        flex: 1,
        minWidth: 200,
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'descricao',
        headerName: 'Descrição',
    },
];

const defaultSort: GridSortModel = [
    { field: 'descricao', sort: 'asc' },
];

const permissions={
    visualizar: PERMISSOES.CADASTROS_VISUALIZAR,
    criar: PERMISSOES.CADASTROS_GERENCIAR,
    editar: PERMISSOES.CADASTROS_GERENCIAR,
    excluir: PERMISSOES.CADASTROS_GERENCIAR,
};

export default function TipoVeiculoList() {
    return (
        <CrudList<TipoVeiculoDTO>
            title="Tipos de Veículos"
            basePath="/app/cadastros/tipos-veiculos"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchTiposVeiculos}
            deleteFn={deleteTipoVeiculo}
            getDeleteItemName={(item) => item.descricao}
            entityName="o tipo de veículo"
            defaultSort={defaultSort}
            icon={<LocalOffer />}
            permissions={permissions}
        />
    );
}
