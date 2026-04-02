import React from 'react';
import {
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    alpha,
} from '@mui/material';
import { CalendarMonth, Search } from '@mui/icons-material';

export interface DatePreset {
    label: string;
    getRange: () => { dataInicio: string; dataFim: string };
}

export interface ConsultaFiltersProps {
    dataInicio: string;
    dataFim: string;
    onDataInicioChange: (value: string) => void;
    onDataFimChange: (value: string) => void;
    onSearch: () => void;
    isLoading?: boolean;
    datePresets?: DatePreset[];
    children?: React.ReactNode;
}

export default function ConsultaFilters({
    dataInicio,
    dataFim,
    onDataInicioChange,
    onDataFimChange,
    onSearch,
    isLoading = false,
    datePresets = [],
    children,
}: Readonly<ConsultaFiltersProps>) {
    const handlePreset = (preset: DatePreset) => {
        const { dataInicio: inicio, dataFim: fim } = preset.getRange();
        onDataInicioChange(inicio);
        onDataFimChange(fim);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <Box
            sx={{
                mb: 3,
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
            }}
        >
            <Stack spacing={2.5}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ md: 'flex-end' }}
                >
                    <TextField
                        size="small"
                        label="Data inicial"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => onDataInicioChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                    />
                    <TextField
                        size="small"
                        label="Data final"
                        type="date"
                        value={dataFim}
                        onChange={(e) => onDataFimChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: 160 }}
                    />

                    {children}

                    <Button
                        variant="contained"
                        onClick={onSearch}
                        disabled={isLoading}
                        startIcon={<Search />}
                        sx={{
                            minWidth: 120,
                            height: 40,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                            },
                        }}
                    >
                        Buscar
                    </Button>
                </Stack>

                {datePresets.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {datePresets.map((preset) => (
                            <Chip
                                key={preset.label}
                                icon={<CalendarMonth fontSize="small" />}
                                label={preset.label}
                                onClick={() => handlePreset(preset)}
                                variant="outlined"
                                clickable
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        borderColor: 'primary.main',
                                    },
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}

export interface StatusSelectProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: Array<{ value: T; label: string }>;
    label?: string;
}

export function StatusSelect<T extends string>({
    value,
    onChange,
    options,
    label = 'Status',
}: StatusSelectProps<T>) {
    return (
        <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value as T)}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
