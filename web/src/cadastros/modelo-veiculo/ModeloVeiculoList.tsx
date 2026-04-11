import React from 'react';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../../components/crud';
import { deleteModeloVeiculo, ModeloVeiculoDTO, searchModelosVeiculos } from './ModeloVeiculoService';
import { DirectionsCar } from '@mui/icons-material';
import { FilterableField } from '../../utils/rsql.utils';
import { PERMISSOES } from '../../contexts/AuthContext';

const columns: GridColDef<ModeloVeiculoDTO>[] = [
    {
        field: 'marca.nome',
        headerName: 'Marca',
        width: 300,
        valueGetter: (_value, row) => row.marca?.nome ?? '',
    },
    {
        field: 'nome',
        headerName: 'Nome',
        flex: 1,
        minWidth: 200,
    },
    {
        field: 'tipo.descricao',
        headerName: 'Tipo de Veículo',
        width: 200,
        valueGetter: (_value, row) => row.tipo?.descricao ?? '',
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'nome',
        headerName: 'Nome',
    },
    {
        field: 'marca.nome',
        headerName: 'Marca',
    },
    {
        field: 'tipo.descricao',
        headerName: 'Tipo',
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

export default function ModeloVeiculoList() {
    return (
        <CrudList<ModeloVeiculoDTO>
            title="Modelos de Veículos"
            basePath="/app/cadastros/modelos"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchModelosVeiculos}
            deleteFn={deleteModeloVeiculo}
            getDeleteItemName={(item) => `${item.marca.nome} - ${item.nome}`}
            entityName="o modelo"
            defaultSort={defaultSort}
            icon={<DirectionsCar />}
            permissions={permissions}
        />
    );
}
