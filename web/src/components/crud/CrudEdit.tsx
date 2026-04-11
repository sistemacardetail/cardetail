import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useParams } from 'react-router-dom';
import PageContainer from '../PageContainer';
import { ApiResult } from '../../services/apiService';
import { Breadcrumb } from '../PageHeader';

export interface CrudEditProps<T> {
    title: string;
    breadcrumbs: Breadcrumb[];
    loadFn: (id: string) => Promise<ApiResult<T>>;
    children: (data: T, reload: () => Promise<void>) => React.ReactNode;
}

export default function CrudEdit<T>({
    title,
    breadcrumbs,
    loadFn,
    children,
}: CrudEditProps<T>) {
    const { id } = useParams<{ id: string }>();
    const entityId = id!;

    const [data, setData] = React.useState<T | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    const loadData = React.useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            const result = await loadFn(entityId);

            if (result.error) {
                setError(new Error(result.error));
            } else if (result.data) {
                setData(result.data);
            }
        } catch (showDataError) {
            setError(showDataError as Error);
        }
        setIsLoading(false);
    }, [entityId, loadFn]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const renderContent = React.useMemo(() => {
        if (isLoading) {
            return (
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        py: 8,
                    }}
                >
                    <CircularProgress />
                </Box>
            );
        }
        if (error) {
            return (
                <Box sx={{ flexGrow: 1 }}>
                    <Alert severity="error">{error.message}</Alert>
                </Box>
            );
        }

        return data ? children(data, loadData) : null;
    }, [isLoading, error, data, children, loadData]);

    return (
        <PageContainer title={title} breadcrumbs={breadcrumbs}>
            {renderContent}
        </PageContainer>
    );
}
