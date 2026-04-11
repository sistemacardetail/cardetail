import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createTheme, Theme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { apiGet, apiPut } from '../services/apiService';

const STORAGE_KEY = 'app_primary_color';
const DEFAULT_COLOR = '#1976d2';
const API_URL = '/api/configuracoes-sistema';

interface ConfiguracaoSistemaDTO {
    chave: string;
    valor: string;
}

export const AVAILABLE_COLORS = [
    { name: 'Azul', value: '#1976d2' },
    { name: 'Azul Escuro', value: '#1565c0' },
    { name: 'Índigo', value: '#3f51b5' },
    { name: 'Roxo', value: '#9c27b0' },
    { name: 'Rosa', value: '#e91e63' },
    { name: 'Vermelho', value: '#d32f2f' },
    { name: 'Laranja', value: '#f57c00' },
    { name: 'Âmbar', value: '#ffa000' },
    { name: 'Verde', value: '#388e3c' },
    { name: 'Verde Azulado', value: '#00897b' },
    { name: 'Ciano', value: '#0097a7' },
    { name: 'Cinza Azulado', value: '#546e7a' },
];

interface ThemeContextType {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    theme: Theme;
    isLoading: boolean;
}

const createAppTheme = (primaryColor: string): Theme => {
    return createTheme({
        palette: {
            primary: {
                main: primaryColor,
            },
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'rgba(0, 0, 0, 0.4)',
                        },
                        '& .MuiInputLabel-root.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.6)',
                        },
                        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.15)',
                        },
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'rgba(0, 0, 0, 0.7)',
                        },
                    },
                },
            },
            MuiInputAdornment: {
                styleOverrides: {
                    root: {
                        '& .MuiTypography-root': {
                            color: 'inherit',
                        },
                    },
                },
            },
        },
    });
};

const ThemeContext = createContext<ThemeContextType>({
    primaryColor: DEFAULT_COLOR,
    setPrimaryColor: () => {},
    theme: createAppTheme(DEFAULT_COLOR),
    isLoading: false,
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [primaryColor, setPrimaryColorState] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved || DEFAULT_COLOR;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState<Theme>(() => createAppTheme(primaryColor));

    // Buscar cor salva no backend ao inicializar
    useEffect(() => {
        const fetchSavedColor = async () => {
            try {
                const result = await apiGet<ConfiguracaoSistemaDTO>(
                    `${API_URL}/cor-primaria`,
                    'Erro ao buscar cor primária'
                );
                if (result.data?.valor) {
                    setPrimaryColorState(result.data.valor);
                    localStorage.setItem(STORAGE_KEY, result.data.valor);
                }
            } catch (error) {
                console.error('Erro ao carregar cor do sistema:', error);
            }
        };

        fetchSavedColor();
    }, []);

    const setPrimaryColor = useCallback(async (color: string) => {
        setPrimaryColorState(color);
        localStorage.setItem(STORAGE_KEY, color);
        setIsLoading(true);

        try {
            await apiPut<ConfiguracaoSistemaDTO>(
                `${API_URL}/cor-primaria`,
                { chave: 'COR_PRIMARIA', valor: color },
                'Erro ao salvar cor primária'
            );
        } catch (error) {
            console.error('Erro ao salvar cor do sistema:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setTheme(createAppTheme(primaryColor));
    }, [primaryColor]);

    const value: ThemeContextType = {
        primaryColor,
        setPrimaryColor,
        theme,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
