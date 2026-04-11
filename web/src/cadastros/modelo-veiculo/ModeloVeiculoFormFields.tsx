import React, { useEffect, useState } from 'react';
import { Autocomplete, Card, Grid, Stack, TextField, Typography, } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { ModeloVeiculoDTO } from './ModeloVeiculoService';
import { MarcaVeiculoDTO, searchMarcas } from '../marca-veiculo/MarcaVeiculoService';
import { searchTipos, TipoVeiculoDTO } from '../tipo-veiculo/TipoVeiculoService';
import { unaccent } from '../../utils/string.utils';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
                px: 3,
                py: 2,
                borderBottom: 1,
                borderColor: 'divider',
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Stack>
        </Stack>
    );
}

interface ModeloVeiculoFormFieldsProps {
    modelo: Partial<ModeloVeiculoDTO>;
    onChange: (field: keyof ModeloVeiculoDTO, value: any) => void;
    errors?: Record<string, string>;
}

export default function ModeloVeiculoFormFields({
    modelo,
    onChange,
    errors = {},
}: ModeloVeiculoFormFieldsProps) {
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
        loadMarcas('');
        loadTipos('');
    }, [loadMarcas, loadTipos]);

    return (
        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            <SectionHeader
                icon={<DirectionsCarIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                title="Dados do Modelo"
            />
            <Stack spacing={3} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={marcas}
                            getOptionLabel={(option) => option.nome}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={loadingMarcas}
                            value={modelo.marca || null}
                            onChange={(_, newValue) => onChange('marca', newValue)}
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
                    </Grid>

                    <Grid size={6}/>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Nome do Modelo"
                            value={modelo.nome ?? ''}
                            onChange={(e) => onChange('nome', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                            placeholder="Ex: Civic, Corolla, Onix..."
                        />
                    </Grid>

                    <Grid size={6}/>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={tipos}
                            getOptionLabel={(option) => option.descricao}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={loadingTipos}
                            value={modelo.tipo || null}
                            onChange={(_, newValue) => onChange('tipo', newValue)}
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
                    </Grid>
                </Grid>
            </Stack>
        </Card>
    );
}
