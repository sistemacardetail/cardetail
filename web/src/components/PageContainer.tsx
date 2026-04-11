'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import PageHeader, { Breadcrumb } from './PageHeader';

export interface PageContainerProps {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export default function PageContainer({
    children,
    title,
    description,
    icon,
    breadcrumbs,
    actions,
    maxWidth = false,
}: PageContainerProps) {
    return (
        <Container
            maxWidth={maxWidth}
            disableGutters
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                px: { xs: 2, md: 4 },
                py: 1,
            }}
        >
            {title && (
                <PageHeader
                    title={title}
                    description={description}
                    icon={icon}
                    breadcrumbs={breadcrumbs}
                    actions={actions}
                />
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Container>
    );
}
