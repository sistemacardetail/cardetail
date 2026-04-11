import React from 'react';
import { Box, Chip } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import { ClienteListDTO, deleteCliente, searchClientes } from './ClienteService';
import { People } from '@mui/icons-material';
import { FilterableField } from '../utils/rsql.utils';
import { PERMISSOES } from '../contexts/AuthContext';

const columns: GridColDef[] = [
    {
        field: 'nome',
        headerName: 'Nome',
        minWidth: 300,
    },
    {
        field: 'telefonePrincipal',
        headerName: 'Telefone',
        width: 200,
        sortable: false,
    },
    {
        field: 'veiculos',
        headerName: 'Veículos',
        flex: 1,
        minWidth: 300,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ClienteListDTO>) => {
            const veiculos = params.value as ClienteListDTO['veiculos'];
            if (!veiculos || veiculos.length === 0) {
                return (
                    <Box
                        sx={{
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                        }}
                    >
                        Nenhum veículo cadastrado
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
                    {veiculos.map((veiculo, index) => (
                        <Chip
                            key={index}
                            label={`${veiculo.marca} ${veiculo.modelo} ${veiculo.cor} [${veiculo.placa}]`}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                        />
                    ))}
                </Box>
            );
        },
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 100,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value}
                color={params.value === 'Ativo' ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
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
        field: 'veiculos.modelo.nome',
        headerName: 'Modelo Veículo',
    },
    {
        field: 'veiculos.placa',
        headerName: 'Placa',
    },
    {
        field: 'telefones.numero',
        headerName: 'Telefone',
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
    visualizar: PERMISSOES.CLIENTES_VISUALIZAR,
    criar: PERMISSOES.CLIENTES_CRIAR,
    editar: PERMISSOES.CLIENTES_EDITAR,
    excluir: PERMISSOES.CLIENTES_EXCLUIR,
};

export default function ClienteList() {
    return (
        <CrudList<ClienteListDTO>
            title="Clientes"
            basePath="/app/clientes"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchClientes}
            deleteFn={deleteCliente}
            getDeleteItemName={(item) => item.nome}
            entityName="o cliente"
            defaultSort={defaultSort}
            icon={<People />}
            permissions={permissions}
        />
    );
}
