import React from 'react';
import { alpha, Box, Typography } from '@mui/material';

interface EventCardTimeGridProps {
    timeText?: string;
    title: string;
    numero?: number;
    status?: string;
    color: string;
    servicosNome?: string[];
    clienteNome?: string;
    veiculoInfo?: string;
    placa?: string;
    durationMinutes: number;
    isMultiDay?: boolean;
    startDate?: string;
    endDate?: string;
}

export default function EventCardTimeGrid({
    timeText,
    title,
    numero,
    status,
    color,
    servicosNome = [],
    clienteNome,
    veiculoInfo,
    placa,
    durationMinutes,
    isMultiDay = false,
    startDate,
    endDate,
}: EventCardTimeGridProps) {
    const isCompact = durationMinutes <= 30;
    const isMedium = durationMinutes > 30 && durationMinutes <= 60;
    const isCancelled = status === 'CANCELADO';

    // Para multi-dia, mostrar datas ao invés de horário
    const displayTime = isMultiDay && startDate && endDate
        ? `${startDate} - ${endDate}`
        : timeText;

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                px: 1,
                py: isCompact ? 0.4 : 0.75,
                borderRadius: '10px',
                bgcolor: isCancelled ? alpha(color, 0.05) : alpha(color, 0.1),
                borderLeft: `4px solid ${isCancelled ? alpha(color, 0.3) : color}`,
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: isCompact ? 0 : 0.25,
                transition: 'background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                '&:hover': {
                    bgcolor: isCancelled ? alpha(color, 0.08) : alpha(color, 0.18),
                    boxShadow: `0 3px 10px ${alpha(color, 0.25)}`,
                    transform: 'translateY(-1px)',
                },
            }}
        >
            {displayTime && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: isCompact ? '0.65rem' : '0.75rem',
                        fontWeight: 700,
                        color: isCancelled ? alpha(color, 0.6) : color,
                        lineHeight: 1.2,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {displayTime}
                </Typography>
            )}

            <Typography
                variant="caption"
                sx={{
                    fontWeight: 700,
                    fontSize: isCompact ? '0.65rem' : '0.75rem',
                    color: isCancelled ? 'text.disabled' : 'text.primary',
                    lineHeight: 1.3,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: isCancelled ? 'line-through' : 'none',
                }}
            >
                {numero ? `#${numero} · ${title}` : title || 'Criar agendamento'}
            </Typography>

            {!isCompact && servicosNome.length > 0 &&
                servicosNome.slice(0, isMedium ? 1 : servicosNome.length).map((nome, index) => (
                    <Typography
                        key={index}
                        variant="caption"
                        sx={{
                            fontSize: isCompact ? '0.65rem' : '0.75rem',
                            fontWeight: 500,
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.3,
                            mt: 'auto',
                            opacity: isCancelled ? 0.6 : 1,
                        }}
                    >
                        {nome}
                    </Typography>
                ))
            }

            {!isCompact && clienteNome && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.70rem',
                        fontWeight: 500,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3,
                        mt: 'auto',
                        opacity: isCancelled ? 0.6 : 1,
                    }}
                >
                    {clienteNome}
                </Typography>
            )}

            {!isCompact && veiculoInfo && (
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.70rem',
                        fontWeight: 500,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3,
                        mt: 'auto',
                        opacity: isCancelled ? 0.6 : 1,
                    }}
                >
                    {veiculoInfo}{placa ? ` · ${placa}` : ''}
                </Typography>
            )}
        </Box>
    );
}
