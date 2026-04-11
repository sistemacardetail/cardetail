import { Autocomplete, Box, Card, FormControlLabel, Grid, TextField, Typography, } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import React from 'react';
import { CustomSwitch } from '../components/CustomSwitch';
import { ServicoTerceirizadoDTO } from './ServicoTerceirizadoService';
import { searchTipos, TipoVeiculoDTO } from '../cadastros';
import PersonIcon from '@mui/icons-material/Person';
import { formatTelefone } from '../utils';
import { unaccent } from '../utils/string.utils';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

function SectionHeader({ icon, title }: Readonly<SectionHeaderProps>) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Box
                sx={{
                    display: 'inline-flex',
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                }}
            >
                {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
        </Box>
    );
}

export interface ServicoFormFieldsProps {
    servicoTerceirizado: Partial<ServicoTerceirizadoDTO>;
    onChange: (field: keyof ServicoTerceirizadoDTO, value: any) => void;
    errors?: Record<string, string>;
}

export default function ServicoTerceirizadoFormFields({
    servicoTerceirizado,
    onChange,
    errors = {},
}: Readonly<ServicoFormFieldsProps>) {
    const isNew = !servicoTerceirizado.id;

    const [tiposVeiculos, setTiposVeiculos] = React.useState<TipoVeiculoDTO[]>([]);
    const [loadingTipos, setLoadingTipos] = React.useState(false);

    interface TiposVeiculoCache {
        tipos: TipoVeiculoDTO[];
    }
    const tiposVeiculosCache = React.useRef<TiposVeiculoCache>({ tipos: [] });

    const handleSearchTipos = React.useCallback(async (searchText: string) => {
        const searchNormalized = unaccent(searchText.toLowerCase());

        if (tiposVeiculosCache.current.tipos.length === 0) {
            setLoadingTipos(true);
            try {
                const { data } = await searchTipos('');
                if (data) {
                    tiposVeiculosCache.current.tipos = data;
                    setTiposVeiculos(
                        data.filter(t => unaccent(t.descricao.toLowerCase()).includes(searchNormalized))
                    );
                }
            } finally {
                setLoadingTipos(false);
            }
        } else {
            setTiposVeiculos(
                tiposVeiculosCache.current.tipos.filter(t =>
                    unaccent(t.descricao.toLowerCase()).includes(searchNormalized)
                )
            );
        }
    }, []);

    React.useEffect(() => {
        handleSearchTipos('');
    }, [handleSearchTipos]);

    const selectedTipos = React.useMemo(() => {
        return (servicoTerceirizado.tiposVeiculos || []).map((tv) => tv.tipo);
    }, [servicoTerceirizado.tiposVeiculos]);

    const handleTiposChange = (_: any, newValue: TipoVeiculoDTO[]) => {
        onChange(
            'tiposVeiculos',
            newValue.map((tipo) => ({ tipo }))
        );
    };

    return (
        <>
        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                },
            }}
        >
            <Box sx={{ p: 3 }}>
                <SectionHeader icon={<LocalCarWashIcon />} title="Dados do Serviço Terceirizado" />
                <Grid container spacing={3}>
                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Nome"
                            value={servicoTerceirizado.nome ?? ''}
                            onChange={(e) => onChange('nome', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                        />
                    </Grid>

                    <Grid size={1}>
                        <FormControlLabel
                            sx={{
                                width: '100%',
                                margin: 0,
                                justifyContent: 'flex-end',
                            }}
                            control={
                                <CustomSwitch
                                    checked={servicoTerceirizado.ativo ?? false}
                                    onChange={(e) => onChange('ativo', e.target.checked)}
                                    disabled={isNew}
                                />
                            }
                            label='Ativo'
                        />
                    </Grid>

                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Descrição"
                            value={servicoTerceirizado.descricao ?? ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                        />
                    </Grid>

                    <Grid size={4}/>

                    <Grid size={8}>
                        <Autocomplete
                            multiple
                            fullWidth
                            size="small"
                            options={tiposVeiculos}
                            getOptionLabel={(option) => option?.descricao ?? ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={loadingTipos}
                            value={selectedTipos}
                            onChange={handleTiposChange}
                            onInputChange={(_, newValue, reason) => {
                                if (reason === 'input') {
                                    handleSearchTipos(newValue);
                                }
                            }}
                            onOpen={() => {handleSearchTipos('')}}
                            noOptionsText="Nenhum tipo encontrado"
                            loadingText="Carregando..."
                            slotProps={{
                                chip: { size: 'small' },
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tipos de Veículos"
                                    required={selectedTipos.length === 0}
                                    error={!!errors.tiposVeiculos}
                                    helperText={errors.tiposVeiculos || 'Selecione os tipos de veículos que este serviço terceirizado atende'}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={3}
                            label="Observações do Serviço Terceirizado"
                            value={servicoTerceirizado.observacao ?? ''}
                            onChange={(e) => onChange('observacao', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Card>

        <Card
            elevation={0}
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                },
            }}
        >
            <Box sx={{ p: 3 }}>
                <SectionHeader icon={<PersonIcon />} title="Dados do Prestador" />
                <Grid container spacing={3}>
                    <Grid size={4}>
                        <TextField
                            fullWidth
                            label="Nome"
                            size={"small"}
                            value={servicoTerceirizado.fornecedor?.nome || ''}
                            onChange={(e) => {
                                onChange('fornecedor', {
                                    ...servicoTerceirizado.fornecedor,
                                    nome: e.target.value,
                                });
                            }}
                            error={!!errors['fornecedor.nome']}
                            helperText={errors['fornecedor.nome']}
                        />
                    </Grid>

                    <Grid size={8}/>

                    <Grid size={{ xs: 3, md: 1 }}>
                        <TextField
                            fullWidth
                            label="DDD"
                            size={"small"}
                            value={servicoTerceirizado.fornecedor?.telefone?.ddd || ''}
                            onChange={(e) => {
                                onChange('fornecedor', {
                                    ...servicoTerceirizado.fornecedor,
                                    telefone: {
                                        ...servicoTerceirizado.fornecedor?.telefone,
                                        ddd: e.target.value.replace(/\D/g, '')
                                    }
                                });
                            }}
                            error={!!errors['fornecedor.telefone.ddd']}
                            helperText={errors['fornecedor.telefone.ddd']}
                            slotProps={{ htmlInput: { maxLength: 2 } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 9, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Número"
                            size={"small"}
                            value={formatTelefone(servicoTerceirizado.fornecedor?.telefone?.numero || '')}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                onChange('fornecedor', {
                                    ...servicoTerceirizado.fornecedor,
                                    telefone: {
                                        ...servicoTerceirizado.fornecedor?.telefone,
                                        numero: digits,
                                    }
                                });
                            }}
                            error={!!errors['fornecedor.telefone.numero']}
                            helperText={errors['fornecedor.telefone.numero']}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Card>
        </>
    );
}
