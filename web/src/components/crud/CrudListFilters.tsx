import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { CustomFilter, EnumOption, FilterableField, filterOperatorsByType } from '../../utils/rsql.utils';

const BOOLEAN_OPTIONS: EnumOption[] = [
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' },
];

export interface CrudListFiltersProps {
    fields: FilterableField[];
    filters: CustomFilter[];
    onFiltersChange: (filters: CustomFilter[]) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    onRemoveFilter: (index: number) => void;
    isLoading?: boolean;
}

export default function CrudListFilters({
    fields,
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
    onRemoveFilter,
    isLoading = false,
}: Readonly<CrudListFiltersProps>) {
    const [isExpanded, setIsExpanded] = React.useState(filters.length > 0);

    const handleToggle = React.useCallback(() => {
        setIsExpanded(prev => {
            const next = !prev;

            if (next && filters.length === 0 && fields.length > 0) {
                const firstField = fields[0];
                const type = firstField.type || 'string';
                const defaultOperator = filterOperatorsByType[type][0].value;

                const newFilter: CustomFilter = {
                    field: firstField.field,
                    operator: defaultOperator,
                    value: '',
                };

                onFiltersChange([newFilter]);
            }

            return next;
        });
    }, [filters.length, fields, onFiltersChange]);

    const handleAddFilter = React.useCallback(() => {
        if (!fields.length) return;

        const firstField = fields[0];
        const type = firstField.type || 'string';
        const defaultOperator = filterOperatorsByType[type][0].value;

        const newFilter: CustomFilter = {
            field: firstField.field,
            operator: defaultOperator,
            value: '',
        };

        onFiltersChange([...filters, newFilter]);
        setIsExpanded(true);
    }, [fields, filters, onFiltersChange]);

    const handleFilterChange = React.useCallback(
        (index: number, fieldKey: keyof CustomFilter, value: string) => {
            const newFilters = [...filters];
            const current = newFilters[index];

            if (fieldKey === 'field') {
                const selectedField = fields.find(f => f.field === value);
                const type = selectedField?.type || 'string';
                const allowedOperators = filterOperatorsByType[type];

                newFilters[index] = {
                    field: value,
                    operator: allowedOperators[0].value,
                    value: '',
                };
            } else {
                newFilters[index] = {
                    ...current,
                    [fieldKey]: value,
                };
            }

            onFiltersChange(newFilters);
        },
        [filters, fields, onFiltersChange]
    );

    const handleKeyPress = React.useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                onApplyFilters();
            }
        },
        [onApplyFilters]
    );

    const handleClear = React.useCallback(() => {
        onClearFilters();
    }, [onClearFilters]);

    const activeFiltersCount = filters.filter(f => f.value).length;

    return (
        <Box sx={{ width: '100%' }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2, py: 2, borderBottom: 2, borderColor: 'divider' }}
            >
                <Tooltip title={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}>
                    <Button
                        size="small"
                        variant={isExpanded ? 'contained' : 'outlined'}
                        onClick={handleToggle}
                        startIcon={<FilterListIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            minWidth: 'auto',
                        }}
                    >
                        Filtros
                        {activeFiltersCount > 0 && (
                            <Chip
                                label={activeFiltersCount}
                                size="small"
                                color="primary"
                                sx={{ ml: 1, height: 20, minWidth: 20 }}
                            />
                        )}
                    </Button>
                </Tooltip>

                <Tooltip title="Adicionar filtro">
                    <IconButton
                        size="small"
                        onClick={handleAddFilter}
                        disabled={isLoading}
                        sx={{
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            },
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {activeFiltersCount > 0 && (
                    <Tooltip title="Limpar filtros">
                        <IconButton
                            size="small"
                            onClick={handleClear}
                            disabled={isLoading}
                            sx={{
                                color: 'error.main',
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                },
                            }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ flex: 1 }} />

                {filters.length > 0 && (
                    <Button
                        size="small"
                        variant="contained"
                        onClick={onApplyFilters}
                        disabled={isLoading}
                        startIcon={<SearchIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Aplicar Filtros
                    </Button>
                )}
            </Stack>

            <Collapse in={isExpanded && filters.length > 0}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={1.5}>
                        {filters.map((filter, index) => {
                            const fieldMeta = fields.find(f => f.field === filter.field);
                            const type = fieldMeta?.type || 'string';
                            const availableOperators = filterOperatorsByType[type];

                            return (
                                <Stack
                                    key={index}
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    {/* SELECT CAMPO */}
                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <InputLabel id={`field-label-${index}`}>Campo</InputLabel>
                                        <Select
                                            labelId={`field-label-${index}`}
                                            value={filter.field}
                                            label="Campo"
                                            onChange={(e) =>
                                                handleFilterChange(index, 'field', e.target.value)
                                            }
                                        >
                                            {fields.map(field => (
                                                <MenuItem key={field.field} value={field.field}>
                                                    {field.headerName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* SELECT OPERADOR */}
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel id={`operator-label-${index}`}>Operador</InputLabel>
                                        <Select
                                            labelId={`operator-label-${index}`}
                                            value={filter.operator}
                                            label="Operador"
                                            onChange={(e) =>
                                                handleFilterChange(index, 'operator', e.target.value)
                                            }
                                        >
                                            {availableOperators.map(op => (
                                                <MenuItem key={op.value} value={op.value}>
                                                    {op.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {(type === 'boolean' || type === 'enum') ? (
                                        <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                                            <InputLabel id={`value-label-${index}`}>Valor</InputLabel>
                                            <Select
                                                labelId={`value-label-${index}`}
                                                value={filter.value}
                                                label="Valor"
                                                onChange={(e) =>
                                                    handleFilterChange(index, 'value', e.target.value)
                                                }
                                            >
                                                {(fieldMeta?.enumOptions || (type === 'boolean' ? BOOLEAN_OPTIONS : [])).map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : type === 'date' ? (
                                        <TextField
                                            size="small"
                                            type="datetime-local"
                                            label="Data/Hora"
                                            value={filter.value}
                                            onChange={(e) =>
                                                handleFilterChange(index, 'value', e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                            }}
                                            sx={{ flex: 1, minWidth: 200 }}
                                        />
                                    ) : (type === 'dateDay') ? (
                                        <TextField
                                            size="small"
                                            type="date"
                                            label="Data"
                                            value={filter.value}
                                            onChange={(e) =>
                                                handleFilterChange(index, 'value', e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                            }}
                                            sx={{ flex: 1, minWidth: 160 }}
                                        />
                                    ) : type === 'number' ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            label="Valor numérico"
                                            value={filter.value}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                if (value === '' || /^\d+$/.test(value)) {
                                                    handleFilterChange(index, 'value', value);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                const allowedKeys = [
                                                    'Backspace',
                                                    'Tab',
                                                    'ArrowLeft',
                                                    'ArrowRight',
                                                    'Delete',
                                                ];

                                                if (
                                                    allowedKeys.includes(e.key) ||
                                                    /^[0-9]$/.test(e.key)
                                                ) {
                                                    return;
                                                }

                                                e.preventDefault();
                                            }}
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]*',
                                                    min: 0,
                                                    step: 1,
                                                },
                                                inputLabel: { shrink: true },
                                            }}
                                            sx={{ flex: 1, minWidth: 150 }}
                                        />
                                    ) : (
                                        <TextField
                                            size="small"
                                            label="Digite para buscar"
                                            value={filter.value}
                                            onChange={(e) =>
                                                handleFilterChange(index, 'value', e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            sx={{ flex: 1, minWidth: 150 }}
                                        />
                                    )}

                                    {/* BOTÃO REMOVER */}
                                    <Tooltip title="Remover filtro">
                                        <IconButton
                                            size="small"
                                            onClick={() => onRemoveFilter(index)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'error.main',
                                                    bgcolor: (theme) =>
                                                        alpha(theme.palette.error.main, 0.08),
                                                },
                                            }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            </Collapse>
        </Box>
    );
}
