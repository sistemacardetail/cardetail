import React from 'react';
import { Card, Grid, Stack, TextField, Typography, } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalOffer } from '@mui/icons-material';
import { MarcaVeiculoDTO } from './MarcaVeiculoService';

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

interface MarcaVeiculoFormFieldsProps {
    marca: Partial<MarcaVeiculoDTO>;
    onChange: (field: keyof MarcaVeiculoDTO, value: any) => void;
    errors?: Record<string, string>;
}

export default function MarcaVeiculoFormFields({
    marca,
    onChange,
    errors = {},
}: MarcaVeiculoFormFieldsProps) {
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
                icon={<LocalOffer sx={{ color: 'primary.main', fontSize: 22 }} />}
                title="Dados da Marca"
            />
            <Stack spacing={3} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Nome da Marca"
                            value={marca.nome ?? ''}
                            onChange={(e) => onChange('nome', e.target.value)}
                            error={!!errors.nome}
                            helperText={errors.nome}
                            placeholder="Ex: Honda, Toyota, Chevrolet..."
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Card>
    );
}
