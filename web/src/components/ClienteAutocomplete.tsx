import React from 'react';
import { Autocomplete, Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { apiGet } from '../services/apiService';

export interface ClienteAutocompleteDTO {
    id: string;
    nome: string;
    telefonePrincipal?: string;
    observacao?: string;
}

export interface ClienteAutocompleteProps {
    value: ClienteAutocompleteDTO | null | undefined;
    onChange: (cliente: ClienteAutocompleteDTO | null) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    showAddButton?: boolean;
}

export const searchClientesAutocomplete = async (
    search: string = ''
): Promise<{ data?: ClienteAutocompleteDTO[]; error?: string }> => {
    const searchTerm = search ? `%${search}%` : '%';
    const params = new URLSearchParams({ search: searchTerm });

    return apiGet<ClienteAutocompleteDTO[]>(
        `/api/clientes/autocomplete?${params}`,
        'Erro ao buscar clientes'
    );
};

export default function ClienteAutocomplete({
    value,
    onChange,
    error,
    disabled,
    required = false,
    showAddButton = false,
}: Readonly<ClienteAutocompleteProps>) {
    const navigate = useNavigate();
    const location = useLocation();

    const [clientes, setClientes] = React.useState<ClienteAutocompleteDTO[]>([]);
    const [loadingClientes, setLoadingClientes] = React.useState(false);
    const [initialLoadDone, setInitialLoadDone] = React.useState(false);
    const searchRequestIdRef = React.useRef(0);

    const searchClientes = React.useCallback(async (searchText: string) => {
        const requestId = ++searchRequestIdRef.current;
        setLoadingClientes(true);
        try {
            const { data } = await searchClientesAutocomplete(searchText);
            if (requestId !== searchRequestIdRef.current) {
                return [];
            }
            if (data) {
                setClientes(data);
                return data;
            }
            setClientes([]);
            return [];
        } finally {
            if (requestId === searchRequestIdRef.current) {
                setLoadingClientes(false);
            }
        }
    }, []);

    const handleSearchClientes = useDebounce(searchClientes, 300);

    React.useEffect(() => {
        const loadInitialData = async () => {
            if (initialLoadDone) return;
            await searchClientes('');
            setInitialLoadDone(true);
        };

        loadInitialData();
    }, [searchClientes, initialLoadDone]);

    const handleAddCliente = () => {
        const currentUrl = location.pathname + location.search;
        navigate('/app/clientes/novo', {
            state: {
                from: currentUrl,
                returnWithVeiculo: true,
            },
        });
    };

    const handleClienteSelect = (_: any, cliente: ClienteAutocompleteDTO | null) => {
        onChange(cliente);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Autocomplete
                    fullWidth
                    size="small"
                    disabled={disabled}
                    options={clientes}
                    getOptionLabel={(option) =>
                        option ? `${option.nome}${option.telefonePrincipal ? ` • ${option.telefonePrincipal}` : ''}` : ''
                    }
                    filterOptions={(options) => options}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    loading={loadingClientes}
                    value={value ?? null}
                    onChange={handleClienteSelect}
                    onInputChange={(_, newValue, reason) => {
                        if (reason === 'input') handleSearchClientes(newValue);
                    }}
                    onOpen={() => handleSearchClientes('')}
                    noOptionsText="Nenhum cliente encontrado"
                    loadingText="Carregando..."
                    renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id}>
                            <Box>
                                <Typography variant="body2" fontWeight={500}>
                                    {option.nome}{option.telefonePrincipal ? ` • ${option.telefonePrincipal}` : ''}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label='Cliente'
                            required={required}
                            error={!!error}
                            helperText={error}
                        />
                    )}
                />
                {showAddButton && !disabled && !value && (
                    <Tooltip title="Cadastrar cliente" arrow>
                        <IconButton
                            size="small"
                            onClick={handleAddCliente}
                            sx={{
                                height: 40,
                                width: 40,
                                flexShrink: 0,
                                borderRadius: 1.5,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                border: 1,
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderColor: 'primary.main',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {value?.observacao && (
                <Box
                    sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: alpha('#1976d2', 0.04),
                        borderRadius: 1,
                        border: 1,
                        borderColor: alpha('#1976d2', 0.1),
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        <strong>Observação do Cliente:</strong> {value.observacao}
                    </Typography>
                </Box>
            )}
        </>
    );
}
