import React from 'react';
import { Autocomplete, Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { searchVeiculosComCliente, VeiculoClienteDTO } from '../agendamentos';
import { VeiculoDTO } from '../clientes/ClienteService';
import { useDebounce } from '../hooks/useDebounce';
import { CorVeiculoDTO, ModeloVeiculoDTO } from '../cadastros';

export interface VeiculoAutocompleteProps {
    value: VeiculoDTO | null | undefined;
    onChange: (veiculo: VeiculoDTO | null) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    showAddButton?: boolean;
}

export interface VeiculoAutoCompleteDTO {
    id?: string;
    modelo: ModeloVeiculoDTO;
    cor: CorVeiculoDTO;
    placa: string | null;
    observacao?: string;
    semPlaca: boolean;
    clienteId: string;
    clienteNome: string;
    clienteObservacao?: string;
    clienteTelefone?: string;
}

export default function VeiculoAutocomplete({
    value,
    onChange,
    error,
    disabled,
    required = false,
    showAddButton = false,
}: Readonly<VeiculoAutocompleteProps>) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [veiculos, setVeiculos] = React.useState<VeiculoClienteDTO[]>([]);
    const [loadingVeiculos, setLoadingVeiculos] = React.useState(false);
    const [selectedVeiculoComCliente, setSelectedVeiculoComCliente] = React.useState<VeiculoClienteDTO | null>(null);
    const [initialLoadDone, setInitialLoadDone] = React.useState(false);
    const searchRequestIdRef = React.useRef(0);

    const searchVeiculos = React.useCallback(async (searchText: string) => {
        const requestId = ++searchRequestIdRef.current;
        setLoadingVeiculos(true);
        try {
            const { data } = await searchVeiculosComCliente(searchText);
            if (requestId !== searchRequestIdRef.current) {
                return [];
            }
            if (data) {
                setVeiculos(data);
                return data;
            }
            setVeiculos([]);
            return [];
        } finally {
            if (requestId === searchRequestIdRef.current) {
                setLoadingVeiculos(false);
            }
        }
    }, []);

    const handleSearchVeiculos = useDebounce(searchVeiculos, 300);

    const veiculoIdFromUrl = searchParams.get('veiculoId');

    React.useEffect(() => {
        const loadInitialData = async () => {
            if (initialLoadDone) return;

            const veiculosData = await searchVeiculos('');

            const targetVeiculoId = veiculoIdFromUrl || value?.id;

            if (targetVeiculoId && veiculosData.length > 0) {
                const veiculoEncontrado = veiculosData.find(v => v.id === targetVeiculoId);
                if (veiculoEncontrado) {
                    setSelectedVeiculoComCliente(veiculoEncontrado);
                    if (veiculoIdFromUrl) {
                        const veiculo: VeiculoAutoCompleteDTO = {
                            id: veiculoEncontrado.id,
                            placa: veiculoEncontrado.placa,
                            modelo: {
                                id: '',
                                nome: veiculoEncontrado.modelo,
                                marca: { id: '', nome: veiculoEncontrado.marca },
                                tipo: { id: veiculoEncontrado.idTipo, descricao: veiculoEncontrado.tipo },
                            },
                            cor: { id: '', nome: veiculoEncontrado.cor },
                            observacao: veiculoEncontrado.observacao,
                            semPlaca: veiculoEncontrado.placa !== '',
                            clienteId: veiculoEncontrado.clienteId,
                            clienteNome: veiculoEncontrado.clienteNome,
                            clienteObservacao: veiculoEncontrado.clienteObservacao,
                            clienteTelefone: veiculoEncontrado.clienteTelefone,
                        };
                        onChange(veiculo);
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.delete('veiculoId');
                        setSearchParams(newSearchParams, { replace: true });
                    }
                }
            }

            setInitialLoadDone(true);
        };

        loadInitialData();
    }, [searchVeiculos, value?.id, initialLoadDone, veiculoIdFromUrl, onChange, searchParams, setSearchParams]);

    const handleAddCliente = () => {
        const currentUrl = location.pathname + location.search;
        navigate('/app/clientes/novo', {
            state: {
                from: currentUrl,
                returnWithVeiculo: true,
            },
        });
    };

    const handleVeiculoSelect = (_: any, veiculoComCliente: VeiculoClienteDTO | null) => {
        setSelectedVeiculoComCliente(veiculoComCliente);
        if (!veiculoComCliente) {
            onChange(null);
            return;
        }
        const veiculo: VeiculoAutoCompleteDTO = {
            id: veiculoComCliente.id,
            placa: veiculoComCliente.placa,
            modelo: {
                id: '',
                nome: veiculoComCliente.modelo,
                marca: { id: '', nome: veiculoComCliente.marca },
                tipo: { id: veiculoComCliente.idTipo, descricao: veiculoComCliente.tipo },
            },
            cor: { id: '', nome: veiculoComCliente.cor },
            observacao: veiculoComCliente.observacao,
            semPlaca: veiculoComCliente.placa !== '',
            clienteId: veiculoComCliente.clienteId,
            clienteNome: veiculoComCliente.clienteNome,
            clienteObservacao: veiculoComCliente.clienteObservacao,
            clienteTelefone: veiculoComCliente.clienteTelefone,
        };
        onChange(veiculo);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Autocomplete
                    fullWidth
                    size="small"
                    disabled={disabled}
                    options={veiculos}
                    getOptionLabel={(option) =>
                        option ? `${option.clienteNome} / ${option.marca} ${option.modelo} ${option.cor} • ${option.placa}` : ''
                    }
                    filterOptions={(options) => options}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    loading={loadingVeiculos}
                    value={selectedVeiculoComCliente}
                    onChange={handleVeiculoSelect}
                    onInputChange={(_, newValue, reason) => {
                        if (reason === 'input') handleSearchVeiculos(newValue);
                    }}
                    onOpen={() => handleSearchVeiculos('')}
                    noOptionsText="Nenhum veículo encontrado"
                    loadingText="Carregando..."
                    renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id}>
                            <Box>
                                <Typography variant="body2" fontWeight={500}>
                                    {option.marca} {option.modelo} {option.cor} • {option.placa}
                                </Typography>
                                <Typography variant="caption">
                                    {option.clienteNome} • {option.clienteTelefone}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label='Cliente/Veículo'
                            required={required}
                            error={!!error}
                            helperText={error}
                        />
                    )}
                />
                {showAddButton && !disabled && !selectedVeiculoComCliente && (
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

            {selectedVeiculoComCliente?.clienteObservacao && (
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
                        <strong>Observação do Cliente:</strong> {selectedVeiculoComCliente.clienteObservacao}
                    </Typography>
                </Box>
            )}

            {selectedVeiculoComCliente?.observacao && (
                <Box
                    sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: alpha('#16760b', 0.04),
                        borderRadius: 1,
                        border: 1,
                        borderColor: alpha('#16760b', 0.1),
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        <strong>Observação do Veículo:</strong> {selectedVeiculoComCliente.observacao}
                    </Typography>
                </Box>
            )}
        </>
    );
}
