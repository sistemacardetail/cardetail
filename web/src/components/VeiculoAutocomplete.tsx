import React from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSearchParams } from 'react-router-dom';
import { VeiculoDTO } from '../clientes/ClienteService';
import { useDebounce } from '../hooks/useDebounce';
import { CorVeiculoDTO, ModeloVeiculoDTO } from '../cadastros';
import { apiGet } from '../services/apiService';
import { ClienteAutocompleteDTO } from './ClienteAutocomplete';

export interface VeiculoAutocompleteProps {
    value: VeiculoDTO | null | undefined;
    onChange: (veiculo: VeiculoDTO | null, clienteData?: ClienteAutocompleteDTO) => void;
    clienteId?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export interface VeiculoAutocompleteResponseDTO {
    id: string;
    modelo: string;
    marca: string;
    cor: string;
    placa: string;
    idTipo: string;
    idCliente: string;
    observacao?: string;
}

export interface VeiculoAutoCompleteDTO {
    id?: string;
    modelo: ModeloVeiculoDTO;
    cor: CorVeiculoDTO;
    placa: string | null;
    observacao?: string;
    semPlaca: boolean;
    clienteId: string;
    clienteNome?: string;
    clienteObservacao?: string;
    clienteTelefone?: string;
}

export const searchVeiculosAutocomplete = async (
    search: string = '',
    clienteId?: string
): Promise<{ data?: VeiculoAutocompleteResponseDTO[]; error?: string }> => {
    const searchTerm = search ? `%${search}%` : '%';
    const params = new URLSearchParams({ search: searchTerm });
    if (clienteId) {
        params.append('idCliente', clienteId);
    }

    return apiGet<VeiculoAutocompleteResponseDTO[]>(
        `/api/veiculos/autocomplete?${params}`,
        'Erro ao buscar veículos'
    );
};

export default function VeiculoAutocomplete({
    value,
    onChange,
    clienteId,
    error,
    disabled,
    required = false,
}: Readonly<VeiculoAutocompleteProps>) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [veiculos, setVeiculos] = React.useState<VeiculoAutocompleteResponseDTO[]>([]);
    const [loadingVeiculos, setLoadingVeiculos] = React.useState(false);
    const [selectedVeiculo, setSelectedVeiculo] = React.useState<VeiculoAutocompleteResponseDTO | null>(null);
    const [initialLoadDone, setInitialLoadDone] = React.useState(false);
    const searchRequestIdRef = React.useRef(0);
    const lastClienteIdRef = React.useRef<string | undefined>(undefined);

    const searchVeiculos = React.useCallback(async (searchText: string, forClienteId?: string) => {
        const requestId = ++searchRequestIdRef.current;
        setLoadingVeiculos(true);
        try {
            const { data } = await searchVeiculosAutocomplete(searchText, forClienteId);
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

    const handleSearchVeiculos = useDebounce((searchText: string) => {
        searchVeiculos(searchText, clienteId);
    }, 300);

    const veiculoIdFromUrl = searchParams.get('veiculoId');

    // Reseta quando clienteId muda
    React.useEffect(() => {
        if (lastClienteIdRef.current !== clienteId) {
            lastClienteIdRef.current = clienteId;
            setVeiculos([]);
            // Recarrega com o novo clienteId
            searchVeiculos('', clienteId);
        }
    }, [clienteId, searchVeiculos]);

    // Carrega inicial e sincroniza valor da URL
    React.useEffect(() => {
        const loadInitialData = async () => {
            if (initialLoadDone) return;

            const veiculosData = await searchVeiculos('', clienteId);

            const targetVeiculoId = veiculoIdFromUrl || value?.id;

            if (targetVeiculoId && veiculosData.length > 0) {
                const veiculoEncontrado = veiculosData.find(v => v.id === targetVeiculoId);
                if (veiculoEncontrado) {
                    setSelectedVeiculo(veiculoEncontrado);
                    if (veiculoIdFromUrl) {
                        const veiculo = mapToVeiculoDTO(veiculoEncontrado);
                        onChange(veiculo, {
                            id: veiculoEncontrado.idCliente,
                            nome: '',
                        });
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.delete('veiculoId');
                        setSearchParams(newSearchParams, { replace: true });
                    }
                }
            }

            setInitialLoadDone(true);
        };

        loadInitialData();
    }, [searchVeiculos, value?.id, initialLoadDone, veiculoIdFromUrl, onChange, searchParams, setSearchParams, clienteId]);

    // Sincroniza selectedVeiculo quando value muda externamente
    React.useEffect(() => {
        if (value?.id && !selectedVeiculo) {
            const veiculoEncontrado = veiculos.find(v => v.id === value.id);
            if (veiculoEncontrado) {
                setSelectedVeiculo(veiculoEncontrado);
            }
        } else if (!value && selectedVeiculo) {
            setSelectedVeiculo(null);
        }
    }, [value, veiculos, selectedVeiculo]);

    const mapToVeiculoDTO = (veiculoResponse: VeiculoAutocompleteResponseDTO): VeiculoAutoCompleteDTO => ({
        id: veiculoResponse.id,
        placa: veiculoResponse.placa,
        modelo: {
            id: '',
            nome: veiculoResponse.modelo,
            marca: { id: '', nome: veiculoResponse.marca },
            tipo: { id: veiculoResponse.idTipo, descricao: '' },
        },
        cor: { id: '', nome: veiculoResponse.cor },
        observacao: veiculoResponse.observacao,
        semPlaca: !veiculoResponse.placa,
        clienteId: veiculoResponse.idCliente,
    });

    const handleVeiculoSelect = (_: any, veiculoSelecionado: VeiculoAutocompleteResponseDTO | null) => {
        setSelectedVeiculo(veiculoSelecionado);
        if (!veiculoSelecionado) {
            onChange(null);
            return;
        }
        const veiculo = mapToVeiculoDTO(veiculoSelecionado);
        onChange(veiculo, {
            id: veiculoSelecionado.idCliente,
            nome: '',
        });
    };

    return (
        <>
            <Autocomplete
                fullWidth
                size="small"
                disabled={disabled}
                options={veiculos}
                getOptionLabel={(option) =>
                    option ? `${option.marca} ${option.modelo} ${option.cor} • ${option.placa || 'Sem placa'}` : ''
                }
                filterOptions={(options) => options}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                loading={loadingVeiculos}
                value={selectedVeiculo}
                onChange={handleVeiculoSelect}
                onInputChange={(_, newValue, reason) => {
                    if (reason === 'input') handleSearchVeiculos(newValue);
                }}
                onOpen={() => searchVeiculos('', clienteId)}
                noOptionsText={clienteId ? "Nenhum veículo encontrado para este cliente" : "Nenhum veículo encontrado"}
                loadingText="Carregando..."
                renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {option.marca} {option.modelo} {option.cor} • {option.placa || 'Sem placa'}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label='Veículo'
                        required={required}
                        error={!!error}
                        helperText={error}
                    />
                )}
            />

            {selectedVeiculo?.observacao && (
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
                        <strong>Observação do Veículo:</strong> {selectedVeiculo.observacao}
                    </Typography>
                </Box>
            )}
        </>
    );
}
