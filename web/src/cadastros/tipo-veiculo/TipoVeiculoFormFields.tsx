import React from 'react';
import { Card, Grid, Stack, TextField, Typography, } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalOffer } from '@mui/icons-material';
import { TipoVeiculoDTO } from './TipoVeiculoService';

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

interface TipoVeiculoFormFieldsProps {
    tipo: Partial<TipoVeiculoDTO>;
    onChange: (field: keyof TipoVeiculoDTO, value: any) => void;
    errors?: Record<string, string>;
}

export default function TipoVeiculoFormFields({
    tipo,
    onChange,
    errors = {},
}: TipoVeiculoFormFieldsProps) {
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
                title="Dados do tipo de veículo"
            />
            <Stack spacing={3} sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            required
                            label="Descrição do tipo"
                            value={tipo.descricao ?? ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            error={!!errors.descricao}
                            helperText={errors.descricao}
                            placeholder="Ex: Carro, Moto..."
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Card>
    );
}
