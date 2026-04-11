import React from 'react';
import { Box, Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Link } from 'react-router';

export interface Breadcrumb {
    title: string;
    path?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    icon,
    breadcrumbs,
    actions,
}: PageHeaderProps) {
    const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 1;

    return (
        <Box sx={{ mb: 3 }}>
            {showBreadcrumbs && (
                <Breadcrumbs
                    separator={<NavigateNextRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
                    sx={{ mb: 1 }}
                >
                    {breadcrumbs.slice(0, -1).map((crumb, index) => (
                        <MuiLink
                            key={index}
                            component={Link}
                            to={crumb.path || '#'}
                            underline="hover"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            {crumb.title}
                        </MuiLink>
                    ))}
                </Breadcrumbs>
            )}

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {icon && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                lineHeight: 1.2,
                            }}
                        >
                            {title}
                        </Typography>
                        {description && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    mt: 0.5,
                                }}
                            >
                                {description}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {actions && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {actions}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
