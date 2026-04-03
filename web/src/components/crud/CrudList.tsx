import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { alpha } from '@mui/material/styles';
import {
    DataGrid,
    GridActionsCellItem,
    gridClasses,
    GridColDef,
    GridEventListener,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDialogs } from '../../hooks/useDialogs';
import { useNotifications } from '../../hooks/useNotifications';
import PageContainer from '../PageContainer';
import { AdvancedSearchParams, ApiMutationResult, PageResponse } from '../../services/apiService';
import { CustomFilter, customFiltersToRsql, FilterableField, getFilterableFields } from '../../utils/rsql.utils';
import CrudListFilters from './CrudListFilters';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionPageGuard } from '../PermissionGuard';

const INITIAL_PAGE_SIZE = 10;

const parseJsonParam = <T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

export interface CrudPermissions {
    visualizar?: string;
    criar?: string;
    editar?: string;
    excluir?: string;
}

export const checkPermission = (
    permissao: string | undefined,
    hasPermissao: (p: string) => boolean
): boolean => {
    if (!permissao) return true;
    return hasPermissao(permissao);
};

export interface CrudListProps<T extends { id?: string }> {
    title: string;
    description?: string;
    basePath: string;
    columns: GridColDef[];
    columnsToFilter: FilterableField[] | GridColDef[];
    searchFn: (params: AdvancedSearchParams) => Promise<{ data?: PageResponse<T>; error?: string }>;
    deleteFn: (id: string) => Promise<ApiMutationResult>;
    getDeleteItemName: (item: T) => string;
    entityName: string;
    icon?: React.ReactNode;
    defaultFilters?: CustomFilter[];
    defaultSort?: GridSortModel;
    extraActions?: (row: T) => React.ReactElement[];
    permissions?: CrudPermissions;
}

export default function CrudList<T extends { id?: string }>({
    title,
    description,
    basePath,
    columns,
    columnsToFilter,
    searchFn,
    deleteFn,
    getDeleteItemName,
    entityName,
    icon,
    defaultFilters = [],
    defaultSort = [],
    extraActions,
    permissions,
}: Readonly<CrudListProps<T>>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const dialogs = useDialogs();
    const notifications = useNotifications();
    const { hasPermissao } = useAuth();

    const canCreate = checkPermission(permissions?.criar, hasPermissao);
    const canEdit = checkPermission(permissions?.editar, hasPermissao);
    const canDelete = checkPermission(permissions?.excluir, hasPermissao);

    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
        pageSize: searchParams.get('pageSize')
            ? Number(searchParams.get('pageSize'))
            : INITIAL_PAGE_SIZE,
    });
    const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
        parseJsonParam<GridFilterModel>(searchParams.get('filter'), { items: [] }),
    );
    const [sortModel, setSortModel] = React.useState<GridSortModel>(
        parseJsonParam<GridSortModel>(searchParams.get('sort'), defaultSort),
    );
    const [customFilters, setCustomFilters] = React.useState<CustomFilter[]>(
        parseJsonParam<CustomFilter[]>(searchParams.get('customFilters'), defaultFilters),
    );

    const [rowsState, setRowsState] = React.useState<{
        rows: T[];
        rowCount: number;
    }>({
        rows: [],
        rowCount: 0,
    });

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    const filterableFields = React.useMemo(
        () => {
            const hasEnumOptions = columnsToFilter.some(col => 'enumOptions' in col);
            const hasRenderCell = columnsToFilter.some(col => 'renderCell' in col);

            if (hasEnumOptions || !hasRenderCell) {
                return columnsToFilter as FilterableField[];
            }

            return getFilterableFields(columnsToFilter as GridColDef[]);
        },
        [columnsToFilter]
    );

    const updateSearchParams = React.useCallback(
        (updates: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams);

            Object.entries(updates).forEach(([key, value]) => {
                if (!value || value === '[]' || value === '{"items":[]}') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });

            setSearchParams(newParams, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    const handlePaginationModelChange = React.useCallback(
        (model: GridPaginationModel) => {
            setPaginationModel(() => ({
                page: model.page,
                pageSize: model.pageSize,
            }));

            updateSearchParams({
                page: String(model.page),
                pageSize: String(model.pageSize),
            });
        },
        [updateSearchParams]
    );

    const handleFilterModelChange = React.useCallback(
        (model: GridFilterModel) => {
            setFilterModel(model);
            setPaginationModel(prev => ({ ...prev, page: 0 }));
            updateSearchParams({
                filter: JSON.stringify(model),
                page: '0',
            });
        },
        [updateSearchParams]
    );

    const handleSortModelChange = React.useCallback(
        (model: GridSortModel) => {
            setSortModel(model);
            setPaginationModel(prev => ({ ...prev, page: 0 }));
            updateSearchParams({
                sort: JSON.stringify(model),
                page: '0',
            });
        },
        [updateSearchParams]
    );

    const handleCustomFiltersChange = React.useCallback(
        (filters: CustomFilter[]) => {
            setCustomFilters(filters);
        },
        []
    );

    const [appliedFilters, setAppliedFilters] = React.useState<CustomFilter[]>(
        parseJsonParam<CustomFilter[]>(searchParams.get('customFilters'), defaultFilters),
    );
    const requestSeqRef = React.useRef(0);

    const handleApplyFilters = React.useCallback(() => {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        setAppliedFilters(customFilters);
        updateSearchParams({
            customFilters: JSON.stringify(customFilters),
            page: '0',
        });
    }, [customFilters, updateSearchParams]);

    const handleClearFilters = React.useCallback(() => {
        setCustomFilters([]);
        setAppliedFilters([]);
        setFilterModel({ items: [] });
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        updateSearchParams({
            customFilters: null,
            filter: null,
            page: '0',
        });
    }, [updateSearchParams]);

    const handleRemoveFilter = React.useCallback(
        (index: number) => {
            const newFilters = customFilters.filter((_, i) => i !== index);

            setCustomFilters(newFilters);
            setAppliedFilters(newFilters);
            setPaginationModel(prev => ({ ...prev, page: 0 }));

            updateSearchParams({
                customFilters: newFilters.length
                    ? JSON.stringify(newFilters)
                    : null,
                page: '0',
            });
        },
        [customFilters, updateSearchParams]
    );

    const loadData = React.useCallback(async () => {
        const requestSeq = ++requestSeqRef.current;
        setIsLoading(true);
        setError(null);

        try {
            const rsqlSearch = customFiltersToRsql(appliedFilters, filterableFields);

            const params: AdvancedSearchParams = {
                page: paginationModel.page,
                size: paginationModel.pageSize,
                search: rsqlSearch || undefined,
                sort: sortModel,
            };

            const result = await searchFn(params);
            if (requestSeq !== requestSeqRef.current) {
                return;
            }

            if (result.error) {
                setError(new Error(result.error));
                setRowsState({ rows: [], rowCount: 0 });
            } else if (result.data) {
                setRowsState({
                    rows: result.data.content ?? [],
                    rowCount: result.data.page?.totalElements ?? 0,
                });
            }
        } catch (err) {
            if (requestSeq !== requestSeqRef.current) {
                return;
            }
            setError(err as Error);
            setRowsState({ rows: [], rowCount: 0 });
        } finally {
            if (requestSeq === requestSeqRef.current) {
                setIsLoading(false);
            }
        }
    }, [
        paginationModel.page,
        paginationModel.pageSize,
        appliedFilters,
        sortModel,
        searchFn,
        filterableFields,
    ]);

    // Carrega dados quando mudam os parâmetros
    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
        ({ row }) => {
            if (!canEdit) return;
            navigate(`${basePath}/${row.id}`);
        },
        [canEdit, navigate, basePath]
    );

    const handleCreateClick = React.useCallback(() => {
        navigate(`${basePath}/novo`);
    }, [navigate, basePath]);

    const handleRowEdit = React.useCallback(
        (item: T) => () => {
            navigate(`${basePath}/${item.id}`);
        },
        [navigate, basePath]
    );

    const handleRowDelete = React.useCallback(
        (item: T) => async () => {
            const ConfirmDeleteDialog = (await import('../ConfirmDeleteDialog')).default;
            const confirmed = await dialogs.open(ConfirmDeleteDialog, {
                itemName: getDeleteItemName(item),
                itemType: entityName,
            });

            if (confirmed) {
                setIsLoading(true);
                try {
                    const result = await deleteFn(item.id!);
                    if (result.error) {
                        notifications.show({
                            message: result.error,
                            severity: 'error',
                        });
                    } else {
                        notifications.show({
                            message: `Excluído com sucesso!`,
                            severity: 'success',
                        });
                        loadData();
                    }
                } catch (deleteError) {
                    notifications.show({
                        message: `Erro ao excluir: ${(deleteError as Error).message}`,
                        severity: 'error',
                    });
                }
                setIsLoading(false);
            }
        },
        [dialogs, notifications, loadData, deleteFn, getDeleteItemName, entityName]
    );

    const columnsWithActions = React.useMemo<GridColDef[]>(
        () => {
            // Calcula se há ações disponíveis
            const hasAnyAction = canEdit || canDelete || extraActions;
            if (!hasAnyAction) {
                return columns.map(col => ({
                    ...col,
                    sortable: col.sortable !== false,
                }));
            }

            const actionsCount = (canEdit ? 1 : 0) + (canDelete ? 1 : 0) + (extraActions ? 1 : 0);
            const actionsWidth = actionsCount * 40 + 20;

            return [
                ...columns.map(col => ({
                    ...col,
                    sortable: col.sortable !== false,
                })),
                {
                    field: 'actions',
                    type: 'actions',
                    headerName: 'Ações',
                    width: actionsWidth,
                    sortable: false,
                    getActions: ({ row }) => {
                        const actions: React.ReactElement[] = [];

                        // Adiciona ações extras primeiro
                        if (extraActions) {
                            actions.push(...extraActions(row));
                        }

                        if (canEdit) {
                            actions.push(
                                <GridActionsCellItem
                                    key="edit-item"
                                    icon={<EditIcon />}
                                    label="Editar"
                                    onClick={handleRowEdit(row)}
                                />
                            );
                        }

                        if (canDelete) {
                            actions.push(
                                <GridActionsCellItem
                                    key="delete-item"
                                    icon={<DeleteIcon sx={{ transition: 'all 0.2s ease', '&:hover': { color: 'error.main' } }} />}
                                    label="Excluir"
                                    onClick={handleRowDelete(row)}
                                />
                            );
                        }

                        return actions;
                    },
                },
            ];
        },
        [columns, handleRowEdit, handleRowDelete, extraActions, canEdit, canDelete]
    );

    const headerActions = canCreate ? (
        <Button
            variant="contained"
            size="small"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
            }}
        >
            Novo
        </Button>
    ) : null;

    return (
        <PermissionPageGuard permissao={permissions?.visualizar}>
        <PageContainer
            title={title}
            description={description}
            icon={icon}
            actions={headerActions}
        >
            <Card
                elevation={0}
                sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                {/* Barra de filtros personalizados */}
                <CrudListFilters
                    fields={filterableFields}
                    filters={customFilters}
                    onFiltersChange={handleCustomFiltersChange}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    onRemoveFilter={handleRemoveFilter}
                    isLoading={isLoading}
                />

                <Box sx={{ flex: 1, width: '100%' }}>
                    {error ? (
                        <Box sx={{ p: 3 }}>
                            <Alert severity="error">{error.message}</Alert>
                        </Box>
                    ) : (
                        <DataGrid
                            rows={rowsState.rows}
                            rowCount={rowsState.rowCount || 0}
                            columns={columnsWithActions}
                            pagination
                            sortingMode="server"
                            sortingOrder={['asc', 'desc']}
                            filterMode="server"
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={handlePaginationModelChange}
                            sortModel={sortModel}
                            onSortModelChange={handleSortModelChange}
                            filterModel={filterModel}
                            onFilterModelChange={handleFilterModelChange}
                            disableRowSelectionOnClick
                            disableColumnFilter
                            disableColumnMenu
                            onRowClick={handleRowClick}
                            loading={isLoading}
                            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                            getRowHeight={() => 'auto'}
                            keepNonExistentRowsSelected={false}
                            localeText={{
                                footerTotalRows: 'Total de linhas:',
                                paginationRowsPerPage: 'Registros por página:',
                                paginationDisplayedRows: () => {
                                    const totalPages = Math.max(
                                        1,
                                        Math.ceil(rowsState.rowCount / paginationModel.pageSize)
                                    );

                                    const currentPage = paginationModel.page + 1;

                                    return `Página ${currentPage} de ${totalPages}`;
                                },
                                noRowsLabel: 'Nenhum registro encontrado',
                                columnMenuLabel: 'Edição de colunas',
                                columnMenuShowColumns: 'Exibir',
                                columnMenuFilter: 'Filtrar',
                                columnMenuHideColumn: 'Esconder',
                                columnMenuUnsort: 'Remover ordenação',
                                columnMenuSortAsc: 'Ordenar ascendente',
                                columnMenuSortDesc: 'Ordenar descendente',
                            }}
                            sx={{
                                border: 'none',
                                [`& .${gridClasses.columnHeaders}`]: {
                                    bgcolor: 'grey.50',
                                },
                                [`& .${gridClasses.columnHeader}`]: {
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: 'text.secondary',
                                },
                                [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                                    outline: 'transparent',
                                },
                                [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                                    {
                                        outline: 'none',
                                    },
                                [`& .${gridClasses.row}`]: {
                                    transition: 'background-color 0.15s ease',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        bgcolor: 'grey.50',
                                    },
                                },
                                [`& .${gridClasses.cell}`]: {
                                    py: 1.5,
                                },
                            }}
                            slotProps={{
                                loadingOverlay: {
                                    variant: 'circular-progress',
                                    noRowsVariant: 'circular-progress',
                                },
                                baseIconButton: {
                                    size: 'small',
                                },
                                pagination: {
                                    showFirstButton: true,
                                    showLastButton: true,
                                },
                            }}
                        />
                    )}
                </Box>
            </Card>
        </PageContainer>
        </PermissionPageGuard>
    );
}
