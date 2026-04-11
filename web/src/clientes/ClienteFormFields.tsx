import React from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';
import { ClienteDTO, TelefoneClienteDTO, TelefoneDTO, VeiculoDTO, } from './ClienteService';
import { formatPlaca, formatTelefone, unformatPlaca, unformatTelefone } from '../utils';
import { CustomSwitch } from '../components/CustomSwitch';
import ModeloVeiculoModal from '../cadastros/modelo-veiculo/ModeloVeiculoModal';
import CorVeiculoModal from '../cadastros/cor-veiculo/CorVeiculoModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { unaccent } from '../utils/string.utils';
import { CorVeiculoDTO, ModeloVeiculoDTO, searchCores, searchModelos } from '../cadastros';
import { useDebounce } from '../hooks/useDebounce';

export interface ClienteFormFieldsProps {
    values: Partial<ClienteDTO>;
    errors?: Record<string, string>;
    onFieldChange: (field: keyof ClienteDTO, value: any) => void;
    onTelefoneChange: (index: number, field: keyof TelefoneClienteDTO, value: string | boolean, telefoneField?: keyof TelefoneDTO) => void;
    onAddTelefone: () => void;
    onRemoveTelefone: (index: number) => void;
    onVeiculoChange: (index: number, field: keyof VeiculoDTO, value: any) => void;
    onAddVeiculo: () => void;
    onRemoveVeiculo: (index: number) => void;
}

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    action?: React.ReactNode;
}

function SectionHeader({ icon, title, action }: SectionHeaderProps) {
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
            {action}
        </Stack>
    );
}

export default function ClienteFormFields({
    values,
    errors = {},
    onFieldChange,
    onTelefoneChange,
    onAddTelefone,
    onRemoveTelefone,
    onVeiculoChange,
    onAddVeiculo,
    onRemoveVeiculo,
}: ClienteFormFieldsProps) {
    const isNew = !values.id;

    const [cores, setCores] = React.useState<CorVeiculoDTO[]>([]);
    const [loadingCores, setLoadingCores] = React.useState(false);
    const [modelos, setModelos] = React.useState<ModeloVeiculoDTO[]>([]);
    const [loadingModelos, setLoadingModelos] = React.useState(false);

    const [modeloModalOpen, setModeloModalOpen] = React.useState(false);
    const [corModalOpen, setCorModalOpen] = React.useState(false);
    const [modeloModalVeiculoIndex, setModeloModalVeiculoIndex] = React.useState<number | null>(null);
    const [corModalVeiculoIndex, setCorModalVeiculoIndex] = React.useState<number | null>(null);

    const telefones = values.telefones || [];
    const veiculos = values.veiculos || [];

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [removeType, setRemoveType] = React.useState<'veiculo' | 'telefone' | null>(null);
    const [removeIndex, setRemoveIndex] = React.useState<number | null>(null);

    interface CoresVeiculoCache {
        cores: CorVeiculoDTO[];
    }
    const coresVeiculosCache = React.useRef<CoresVeiculoCache>({ cores: [] });

    const handleAskRemoveVeiculo = (index: number) => {
        setRemoveType('veiculo');
        setRemoveIndex(index);
        setConfirmOpen(true);
    };

    const handleAskRemoveTelefone = (index: number) => {
        setRemoveType('telefone');
        setRemoveIndex(index);
        setConfirmOpen(true);
    };

    const handleSearchCores = React.useCallback(async (searchText: string) => {
        const searchNormalized = unaccent(searchText.toLowerCase());

        if (coresVeiculosCache.current.cores.length === 0) {
            setLoadingCores(true);
            try {
                const { data } = await searchCores('');
                if (data) {
                    coresVeiculosCache.current.cores = data;
                    setCores(
                        data.filter(c => unaccent(c.nome.toLowerCase()).includes(searchNormalized))
                    );
                }
            } finally {
                setLoadingCores(false);
            }
        } else {
            setCores(
                coresVeiculosCache.current.cores.filter(c =>
                    unaccent(c.nome.toLowerCase()).includes(searchNormalized)
                )
            );
        }
    }, []);

    const loadModelos = React.useCallback(async (searchText: string) => {
        setLoadingModelos(true);
        try {
            const { data } = await searchModelos(searchText);
            if (data) {
                setModelos(data);
            }
        } finally {
            setLoadingModelos(false);
        }
    }, []);

    const handleSearchModelos = useDebounce(loadModelos, 200);

    React.useEffect(() => {
        handleSearchModelos('');
        handleSearchCores('');
    }, [handleSearchModelos, handleSearchCores]);

    const handleOpenModeloModal = (veiculoIndex: number) => {
        setModeloModalVeiculoIndex(veiculoIndex);
        setModeloModalOpen(true);
    };

    const handleOpenCorModal = (veiculoIndex: number) => {
        setCorModalVeiculoIndex(veiculoIndex);
        setCorModalOpen(true);
    };

    const handleModeloCreated = (novoModelo: ModeloVeiculoDTO) => {
        // Adiciona o novo modelo à lista
        setModelos((prev) => [novoModelo, ...prev]);
        // Seleciona o modelo no veículo correspondente
        if (modeloModalVeiculoIndex !== null) {
            onVeiculoChange(modeloModalVeiculoIndex, 'modelo', novoModelo);
        }
        setModeloModalVeiculoIndex(null);
    };

    const handleCorCreated = (novaCor: CorVeiculoDTO) => {
        // Adiciona a nova cor à lista
        setCores((prev) => [novaCor, ...prev]);
        // Seleciona a cor no veículo correspondente
        if (corModalVeiculoIndex !== null) {
            onVeiculoChange(corModalVeiculoIndex, 'cor', novaCor);
        }
        setCorModalVeiculoIndex(null);
    };

    return (
        <>
            {/* DADOS DO CLIENTE */}
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
                    icon={<PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                    title="Dados do Cliente"
                />
                <Stack spacing={3} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <TextField
                                fullWidth
                                size="small"
                                required
                                label="Nome"
                                value={values.nome ?? ''}
                                onChange={(e) => onFieldChange('nome', e.target.value)}
                                error={!!errors.nome}
                                helperText={errors.nome}
                            />
                        </Grid>

                        <Grid size={1}>
                            <FormControlLabel
                                control={
                                    <CustomSwitch
                                        checked={values.ativo ?? false}
                                        onChange={(e) => onFieldChange('ativo', e.target.checked)}
                                        disabled={isNew}
                                    />
                                }
                                label='Ativo'
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={3}
                                label="Observações do Cliente"
                                value={values.observacao ?? ''}
                                onChange={(e) => onFieldChange('observacao', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </Card>

            {/* VEÍCULOS */}
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
                    title="Veículos"
                    action={
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={onAddVeiculo}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Adicionar
                        </Button>
                    }
                />
                <Stack spacing={2} sx={{ p: 3 }}>
                    {veiculos.length === 0 ? (
                        <Typography align="center" color="text.secondary" py={4} sx={{ fontStyle: 'italic' }}>
                            Nenhum veículo cadastrado
                        </Typography>
                    ) : (
                        veiculos.map((veiculo, index) => (
                            <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    },
                                }}
                            >
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={modelos}
                                                getOptionLabel={(option) =>
                                                    option?.nome
                                                        ? option.marca?.nome + ' - ' + option.nome
                                                        : ''
                                                }
                                                isOptionEqualToValue={(option, value) =>
                                                    option.id === value.id
                                                }
                                                loading={loadingModelos}
                                                value={veiculo?.modelo ?? null}
                                                onChange={(_, newValue) => {
                                                    onVeiculoChange(index, 'modelo', newValue ?? null);
                                                }}
                                                onInputChange={(_, newValue, reason) => {
                                                    if (reason === 'input' && newValue.length >= 2) {
                                                        handleSearchModelos(newValue);
                                                    }
                                                }}
                                                onOpen={() => {handleSearchModelos('')}}
                                                noOptionsText="Nenhum modelo encontrado"
                                                loadingText="Carregando..."
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Modelo" required />
                                                )}
                                            />
                                            {!veiculo?.modelo && (
                                                <Tooltip title="Adicionar novo modelo" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenModeloModal(index)}
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
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={cores}
                                                getOptionLabel={(option) => option.nome}
                                                isOptionEqualToValue={(option, value) =>
                                                    option.id === value.id
                                                }
                                                loading={loadingCores}
                                                value={veiculo?.cor || null}
                                                onChange={(_, newValue) => {
                                                    onVeiculoChange(index, 'cor', newValue ?? null);
                                                }}
                                                onInputChange={(_, newValue, reason) => {
                                                    if (reason === 'input' && newValue.length >= 2) {
                                                        handleSearchCores(newValue);
                                                    }
                                                }}
                                                onOpen={() => {handleSearchCores('')}}
                                                noOptionsText="Nenhuma cor encontrada"
                                                loadingText="Carregando..."
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Cor" required />
                                                )}
                                            />
                                            {!veiculo?.cor && (
                                                <Tooltip title="Adicionar nova cor" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenCorModal(index)}
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
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 2 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={veiculo.semPlaca ? "Sem placa" : "Placa"}
                                            required={!veiculo.semPlaca}
                                            disabled={veiculo.semPlaca}
                                            placeholder="ABC-1324"
                                            value={formatPlaca(veiculo.placa ?? '')}
                                            onChange={(e) => {
                                                const raw = unformatPlaca(e.target.value);
                                                onVeiculoChange(index, 'placa', raw);
                                            }}
                                            slotProps={{
                                                htmlInput: { maxLength: 8 },
                                            }}
                                        />
                                    </Grid>

                                    {(!veiculo?.placa) && (
                                        <Grid size={{ xs: 6, sm: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <CustomSwitch
                                                        checked={veiculo.semPlaca}
                                                        onChange={(e) =>
                                                            onVeiculoChange(index, 'semPlaca', e.target.checked)
                                                        }
                                                    />
                                                }
                                                label="Veículo sem placa"
                                            />
                                        </Grid>
                                    )}

                                    <Grid
                                        size={{ xs: 'auto' }}
                                        display="flex"
                                        justifyContent="flex-end"
                                        sx={{ ml: 'auto' }}
                                    >
                                        <Tooltip title="Remover veículo" arrow>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleAskRemoveVeiculo(index)}
                                                sx={{
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#d32f2f', 0.08),
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            multiline
                                            minRows={2}
                                            label="Observações do Veículo"
                                            value={veiculo.observacao ?? ''}
                                            onChange={(e) =>
                                                onVeiculoChange(index, 'observacao', e.target.value)
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Card>
                        ))
                    )}
                </Stack>
            </Card>

            {/* TELEFONES */}
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
                    icon={<PhoneIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                    title="Telefones"
                    action={
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={onAddTelefone}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Adicionar
                        </Button>
                    }
                />
                <Stack spacing={2} sx={{ p: 3 }}>
                    {telefones.length === 0 ? (
                        <Typography align="center" color="text.secondary" py={4} sx={{ fontStyle: 'italic' }}>
                            Nenhum telefone cadastrado
                        </Typography>
                    ) : (
                        telefones.map((telefoneRow, index) => (
                            <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                    px: 2.5,
                                    py: 2,
                                    borderRadius: 2,
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    },
                                }}
                            >
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 3, sm: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="DDD"
                                            value={telefoneRow.telefone.ddd}
                                            required
                                            onChange={(e) =>
                                                onTelefoneChange(
                                                    index,
                                                    'telefone',
                                                    e.target.value.replace(/\D/g, ''),
                                                    'ddd'
                                                )
                                            }
                                            slotProps={{
                                                htmlInput: { maxLength: 2 },
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 9, sm: 3 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Número"
                                            placeholder="99999-9999"
                                            value={formatTelefone(telefoneRow.telefone.numero)}
                                            required
                                            onChange={(e) => {
                                                const raw = unformatTelefone(e.target.value);
                                                onTelefoneChange(index, 'telefone', raw, 'numero');
                                            }}
                                            slotProps={{
                                                htmlInput: { maxLength: 10 },
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 6, sm: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <CustomSwitch
                                                    checked={telefoneRow.principal}
                                                    onChange={(e) =>
                                                        onTelefoneChange(
                                                            index,
                                                            'principal',
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            }
                                            label="Principal"
                                        />
                                    </Grid>

                                    <Grid
                                        size={{ xs: 'auto' }}
                                        display="flex"
                                        justifyContent="flex-end"
                                        sx={{ ml: 'auto' }}
                                    >
                                        <Tooltip title="Remover telefone" arrow>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleAskRemoveTelefone(index)}
                                                sx={{
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#d32f2f', 0.08),
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Card>
                        ))
                    )}
                </Stack>
            </Card>

            {/* Modais de criação rápida */}
            <ModeloVeiculoModal
                open={modeloModalOpen}
                onClose={() => {
                    setModeloModalOpen(false);
                    setModeloModalVeiculoIndex(null);
                }}
                onSuccess={handleModeloCreated}
            />

            <CorVeiculoModal
                open={corModalOpen}
                onClose={() => {
                    setCorModalOpen(false);
                    setCorModalVeiculoIndex(null);
                }}
                onSuccess={handleCorCreated}
            />

            <ConfirmDeleteDialog
                open={confirmOpen}
                payload={{
                    itemName:
                        removeType === 'veiculo'
                            ? veiculos[removeIndex ?? 0]?.modelo?.nome ?? ''
                            : telefones[removeIndex ?? 0]?.telefone?.numero ? `${telefones[removeIndex ?? 0]?.telefone?.numero}` : '',
                    itemType:
                        removeType === 'veiculo'
                            ? 'o veículo'
                            : 'o telefone',
                }}
                onClose={async (confirmed) => {
                    setConfirmOpen(false);

                    if (confirmed && removeIndex !== null) {
                        if (removeType === 'veiculo') {
                            onRemoveVeiculo(removeIndex);
                        }

                        if (removeType === 'telefone') {
                            onRemoveTelefone(removeIndex);
                        }
                    }

                    setRemoveIndex(null);
                    setRemoveType(null);
                }}
            />
        </>
    );
}