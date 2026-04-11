import React from 'react';
import { alpha, Box, Typography } from '@mui/material';

interface EventCardMonthProps {
    timeText?: string;
    title: string;
    numero?: number;
    color: string;
}

export default function EventCardMonth({ timeText, title, numero, color }: EventCardMonthProps) {
    return (
        <Box
            sx={{
                width: '100%',
                px: 0.75,
                py: 0.4,
                borderRadius: '6px',
                bgcolor: alpha(color, 0.1),
                borderLeft: `3px solid ${color}`,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: alpha(color, 0.22) },
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    color: 'text.primary',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.4,
                }}
            >
                {timeText && (
                    <Box component="span" sx={{ mr: 0.5, color, fontWeight: 700 }}>
                        {timeText}
                    </Box>
                )}
                {numero ? `#${numero} · ` : ''}{title}
            </Typography>
        </Box>
    );
}
