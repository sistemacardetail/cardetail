import React, { useEffect, useState } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useNotifications } from '../../hooks/useNotifications';
import { createModeloVeiculoWithResponse } from './ModeloVeiculoService';
import { MarcaVeiculoDTO, searchMarcas } from '../marca-veiculo/MarcaVeiculoService';
import { searchTipos, TipoVeiculoDTO } from '../tipo-veiculo/TipoVeiculoService';
import { extractFieldErrors, formatApiErrors } from '../../services/apiService';
import { unaccent } from '../../utils/string.utils';

interface ModeloVeiculoModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (modelo: any) => void;
}

export default function ModeloVeiculoModal({ open, onClose, onSuccess }: ModeloVeiculoModalProps) {
    const notifications = useNotifications();
    const [loading, setLoading] = useState(false);
    const [nome, setNome] = useState('');
    const [marca, setMarca] = useState<MarcaVeiculoDTO | null>(null);
    const [tipo, setTipo] = useState<TipoVeiculoDTO | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [marcas, setMarcas] = useState<MarcaVeiculoDTO[]>([]);
    const [loadingMarcas, setLoadingMarcas] = useState(false);
    const [tipos, setTipos] = useState<TipoVeiculoDTO[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(false);

    interface TiposVeiculoCache {
        tipos: TipoVeiculoDTO[];
    }
    const tiposVeiculosCache = React.useRef<TiposVeiculoCache>({ tipos: [] });

    interface MarcasVeiculoCache {
        marcas: MarcaVeiculoDTO[];
    }
    const marcasVeiculosCache = React.useRef<MarcasVeiculoCache>({ marcas: [] });

    const loadMarcas = React.useCallback(async (searchText: string) => {
        const searchNormalized = unaccent(searchText.toLowerCase());

        if (marcasVeiculosCache.current.marcas.length === 0) {
            setLoadingMarcas(true);
            try {
                const { data } = await searchMarcas('');
                if (data) {
                    marcasVeiculosCache.current.marcas = data;
                    setMarcas(
                        data.filter(m => unaccent(m.nome.toLowerCase()).includes(searchNormalized))
                    );
                }
            } finally {
                setLoadingMarcas(false);
            }
        } else {
            setMarcas(
                marcasVeiculosCache.current.marcas.filter(m =>
                    unaccent(m.nome.toLowerCase()).includes(searchNormalized)
                )
            );
        }
    }, []);

    const loadTipos = React.useCallback(async (searchText: string) => {
        const searchNormalized = unaccent(searchText.toLowerCase());

        if (tiposVeiculosCache.current.tipos.length === 0) {
            setLoadingTipos(true);
            try {
                const { data } = await searchTipos('');
                if (data) {
                    tiposVeiculosCache.current.tipos = data;
                    setTipos(
                        data.filter(t => unaccent(t.descricao.toLowerCase()).includes(searchNormalized))
                    );
                }
            } finally {
                setLoadingTipos(false);
            }
        } else {
            setTipos(
                tiposVeiculosCache.current.tipos.filter(t =>
                    unaccent(t.descricao.toLowerCase()).includes(searchNormalized)
                )
            );
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadMarcas('');
            loadTipos('');
            setNome('');
            setMarca(null);
            setTipo(null);
            setErrors({});
        }
    }, [open, loadMarcas, loadTipos]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!marca) {
            newErrors.marca = 'Marca é obrigatória';
        }

        if (!nome.trim()) {
            newErrors.nome = 'Nome do modelo é obrigatório';
        }

        if (!tipo) {
            newErrors.tipo = 'Tipo de veículo é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const result = await createModeloVeiculoWithResponse({
                nome: nome.trim(),
                marca: marca!,
                tipo: tipo!,
            });

            if (result.error) {
                const errorMessage = formatApiErrors(result.errors) || result.error;
                notifications.show({
                    message: errorMessage,
                    severity: 'error',
                });

                const fieldErrors = extractFieldErrors(result.errors);
                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(fieldErrors);
                }
                return;
            }

            if (result.data) {
                notifications.show({
                    message: 'Modelo criado com sucesso!',
                    severity: 'success',
                });
                onSuccess(result.data);
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_event, reason) => {
                // Impede fechamento por clique fora ou ESC
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                onClose();
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                        }}
                    >
                        <DirectionsCarIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            Novo Modelo de Veículo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Preencha os dados para cadastrar um novo modelo
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                            color: 'error.main',
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Content */}
            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={2.5}>
                    <Autocomplete
                        fullWidth
                        size="small"
                        options={marcas}
                        getOptionLabel={(option) => option.nome}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={loadingMarcas}
                        value={marca}
                        onChange={(_, newValue) => {
                            setMarca(newValue);
                            if (newValue && errors.marca) {
                                setErrors((prev) => ({ ...prev, marca: '' }));
                            }
                        }}
                        onInputChange={(_, newValue, reason) => {
                            if (reason === 'input' && newValue.length >= 2) {
                                loadMarcas(newValue);
                            }
                        }}
                        onOpen={() => {loadMarcas('')}}
                        noOptionsText="Nenhuma marca encontrada"
                        loadingText="Carregando..."
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Marca"
                                required
                                error={!!errors.marca}
                                helperText={errors.marca}
                            />
                        )}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="Nome do Modelo"
                        required
                        value={nome}
                        onChange={(e) => {
                            setNome(e.target.value);
                            if (e.target.value.trim() && errors.nome) {
                                setErrors((prev) => ({ ...prev, nome: '' }));
                            }
                        }}
                        error={!!errors.nome}
                        helperText={errors.nome}
                        placeholder="Ex: Civic, Corolla, Onix..."
                    />

                    <Autocomplete
                        fullWidth
                        size="small"
                        options={tipos}
                        getOptionLabel={(option) => option.descricao}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={loadingTipos}
                        value={tipo}
                        onChange={(_, newValue) => {
                            setTipo(newValue);
                            if (newValue && errors.tipo) {
                                setErrors((prev) => ({ ...prev, tipo: '' }));
                            }
                        }}
                        onInputChange={(_, newValue, reason) => {
                            if (reason === 'input' && newValue.length >= 2) {
                                loadTipos(newValue);
                            }
                        }}
                        onOpen={() => {loadTipos('')}}
                        noOptionsText="Nenhum tipo encontrado"
                        loadingText="Carregando..."
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tipo de Veículo"
                                required
                                error={!!errors.tipo}
                                helperText={errors.tipo}
                            />
                        )}
                    />
                </Stack>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    borderTop: 1,
                    borderColor: 'divider',
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    color="inherit"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    }}
                >
                    {loading ? 'Salvando...' : 'Salvar Modelo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
