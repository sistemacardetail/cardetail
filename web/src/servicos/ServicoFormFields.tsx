import {
    Autocomplete,
    Box,
    Card,
    FormControlLabel,
    Grid,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import { ServicoDTO } from './ServicoService';
import React from 'react';
import { CustomSwitch } from '../components/CustomSwitch';
import { InfoOutlined } from '@mui/icons-material';
import MoneyInput from '../components/MoneyInput';
import { searchTipos, TipoVeiculoDTO } from '../cadastros';
import { unaccent } from '../utils/string.utils';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
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
    servico: Partial<ServicoDTO>;
    onChange: (field: keyof ServicoDTO, value: any) => void;
    errors?: Record<string, string>;
}

export default function ServicoFormFields({
    servico,
    onChange,
    errors = {},
}: ServicoFormFieldsProps) {
    const isNew = !servico.id;

    const [tiposVeiculos, setTiposVeiculos] = React.useState<TipoVeiculoDTO[]>([]);
    const [loadingTipos, setLoadingTipos] = React.useState(false);

    interface TiposVeiculoCache {
        tipos: TipoVeiculoDTO[];
    }

    const tiposVeiculosCache = React.useRef<TiposVeiculoCache>({ tipos: [] });

    const disponibilidadeError = !servico.disponivelPacote && !servico.disponivelAgendamento;

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
        return (servico.tiposVeiculos || []).map((tv) => tv.tipo);
    }, [servico.tiposVeiculos]);

    const handleTiposChange = (_: any, newValue: TipoVeiculoDTO[]) => {
        onChange(
            'tiposVeiculos',
            newValue.map((tipo) => ({ tipo }))
        );
    };

    return (
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
                <SectionHeader icon={<LocalCarWashIcon />} title="Dados do Serviço" />
                <Grid container spacing={3}>
                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Nome"
                            value={servico.nome ?? ''}
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
                                    checked={servico.ativo ?? false}
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
                            value={servico.descricao ?? ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                        />
                    </Grid>

                    <Grid size={4}/>

                    <Grid size={2}>
                        <MoneyInput
                            fullWidth
                            size="small"
                            required
                            label="Valor"
                            value={servico.valor}
                            onChange={(val) => onChange('valor', val)}
                            error={!!errors.valor}
                            helperText={errors.valor}
                        />
                    </Grid>

                    <Grid size={2}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Tempo de Execução"
                            type="number"
                            value={servico.tempoExecucaoMin ?? 0}
                            onChange={(e) => onChange('tempoExecucaoMin', Number.parseInt(e.target.value) || 0)}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                                },
                                htmlInput: {
                                    min: 0
                                }
                            }}
                            error={!!errors.tempoExecucaoMin}
                            helperText={errors.tempoExecucaoMin}
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
                                    helperText={errors.tiposVeiculos || 'Selecione os tipos de veículos que este serviço atende'}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={2}/>

                    <Grid size={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 4,
                                    p: disponibilidadeError ? 1.5 : 0,
                                    borderRadius: 1,
                                    border: disponibilidadeError ? 1 : 0,
                                    borderColor: 'error.main',
                                    bgcolor: disponibilidadeError ? (theme) => alpha(theme.palette.error.main, 0.04) : 'transparent',
                                }}
                            >
                                <FormControlLabel
                                    sx={{
                                        margin: 0,
                                    }}
                                    control={
                                        <CustomSwitch
                                            checked={servico.disponivelPacote ?? false}
                                            onChange={(e) => onChange('disponivelPacote', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            Disponível para pacote
                                            <Tooltip title="Permite incluir este serviço na composição de pacote de serviços.">
                                                <InfoOutlined
                                                    sx={{
                                                        ml: 0.5,
                                                        fontSize: 16,
                                                        color: 'text.secondary',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    }
                                />

                                <FormControlLabel
                                    sx={{
                                        margin: 0,
                                    }}
                                    control={
                                        <CustomSwitch
                                            checked={servico.disponivelAgendamento ?? false}
                                            onChange={(e) => onChange('disponivelAgendamento', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            Disponível para agendamento
                                            <Tooltip title="Permite oferecer este serviço individualmente no momento do agendamento, sem vínculo com pacote.">
                                                <InfoOutlined
                                                    sx={{
                                                        ml: 0.5,
                                                        fontSize: 16,
                                                        color: 'text.secondary',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    }
                                />
                            </Box>
                            {disponibilidadeError && (
                                <Typography variant="caption" color="error">
                                    Selecione pelo menos uma opção
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid size={8}>
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={3}
                            label="Observações do Serviço"
                            value={servico.observacao ?? ''}
                            onChange={(e) => onChange('observacao', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
}
