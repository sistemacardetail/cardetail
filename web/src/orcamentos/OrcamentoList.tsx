import { GridActionsCellItem, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { CrudList } from '../components/crud';
import StatusChip from '../components/StatusChip';
import { deleteOrcamento, downloadOrcamentoPdf, OrcamentoListDTO, searchOrcamentos } from './OrcamentoService';
import {
    orcamentoStatusConfig,
    renderCurrencyCell,
    renderPacoteCell,
    renderServicosCell,
    renderVeiculoCell,
} from '../utils';
import { FilterableField } from '../utils/rsql.utils';
import React from 'react';
import { RequestPage } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import { useNotifications } from '../hooks/useNotifications';
import { PERMISSOES } from '../contexts/AuthContext';

const defaultSort: GridSortModel = [
    { field: 'numero', sort: 'desc' },
];

const columns: GridColDef[] = [
    {
        field: 'numero',
        headerName: 'Número',
        width: 100,
    },
    {
        field: 'clienteNome',
        headerName: 'Cliente',
        width: 200,
        sortable: false,
        renderCell: (params) => params.value || '-',
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
        headerName: 'Valor Final',
        width: 120,
        sortable: false,
        renderCell: renderCurrencyCell,
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams<OrcamentoListDTO>) => (
            <StatusChip type="orcamento" status={params.value} />
        ),
    },
];

const columnsToFilter: FilterableField[] = [
    {
        field: 'numero',
        headerName: 'Número',
        type: 'number'
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
        field: 'status',
        headerName: 'Status',
        type: 'enum',
        enumOptions: Object.entries(orcamentoStatusConfig).map(([value, config]) => ({
            value,
            label: config.label,
        })),
    },
];

const permissions={
    visualizar: PERMISSOES.ORCAMENTOS_VISUALIZAR,
    criar: PERMISSOES.ORCAMENTOS_CRIAR,
    editar: PERMISSOES.ORCAMENTOS_EDITAR,
    excluir: PERMISSOES.ORCAMENTOS_EXCLUIR,
};

export default function OrcamentoList() {
    const notifications = useNotifications();

    const handleImprimir = React.useCallback(
        (orcamento: OrcamentoListDTO) => async () => {
            const result = await downloadOrcamentoPdf(orcamento.id, orcamento.numero);

            if (result.error) {
                notifications.show({
                    message: result.error,
                    severity: 'error',
                });
                return;
            }

            notifications.show({
                message: 'PDF gerado com sucesso!',
                severity: 'success',
            });
        },
        [notifications]
    );

    const extraActions = React.useCallback(
        (row: OrcamentoListDTO) => [
            <GridActionsCellItem
                key="print-item"
                icon={<PrintIcon />}
                label="Imprimir"
                onClick={handleImprimir(row)}
                showInMenu={false}
            />,
        ],
        [handleImprimir]
    );

    return (
        <CrudList<OrcamentoListDTO>
            title="Orçamentos"
            basePath="/app/orcamentos"
            columns={columns}
            columnsToFilter={columnsToFilter}
            searchFn={searchOrcamentos}
            deleteFn={deleteOrcamento}
            getDeleteItemName={(item) => `número ${item.numero}`}
            entityName="o orçamento"
            icon={<RequestPage />}
            defaultSort={defaultSort}
            extraActions={extraActions}
            permissions={permissions}
        />
    );
}
