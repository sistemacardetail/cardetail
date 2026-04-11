import React from 'react';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../../components/crud';
import { deleteMarcaVeiculo, MarcaVeiculoDTO, searchMarcasVeiculos } from './MarcaVeiculoService';
import { LocalOffer } from '@mui/icons-material';
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

export default function MarcaVeiculoList() {
    return (
        <CrudList<MarcaVeiculoDTO>
            title="Marcas de Veículos"
            basePath="/app/cadastros/marcas"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchMarcasVeiculos}
            deleteFn={deleteMarcaVeiculo}
            getDeleteItemName={(item) => item.nome}
            entityName="a marca"
            defaultSort={defaultSort}
            icon={<LocalOffer />}
            permissions={permissions}
        />
    );
}
