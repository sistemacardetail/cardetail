import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { EmpresaDTO, EmpresaService } from '../configuracoes';

interface EmpresaContextType {
    empresa: EmpresaDTO | null;
    nomeEmpresa: string | null;
    loading: boolean;
    refreshEmpresa: () => Promise<void>;
    setEmpresa: (empresa: EmpresaDTO | null) => void;
}

const EmpresaContext = createContext<EmpresaContextType>({
    empresa: null,
    nomeEmpresa: null,
    loading: true,
    refreshEmpresa: async () => {},
    setEmpresa: () => {},
});

export const useEmpresa = () => useContext(EmpresaContext);

interface EmpresaProviderProps {
    children: React.ReactNode;
}

export const EmpresaProvider: React.FC<EmpresaProviderProps> = ({ children }) => {
    const [empresa, setEmpresaState] = useState<EmpresaDTO | null>(null);
    const [nomeEmpresa, setNomeEmpresa] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const setEmpresa = useCallback((emp: EmpresaDTO | null) => {
        setEmpresaState(emp);
        setNomeEmpresa(emp?.nomeFantasia ?? null);
    }, []);

    const refreshEmpresa = useCallback(async () => {
        try {
            setLoading(true);
            const result = await EmpresaService.buscar();
            if (result.data) {
                setEmpresa(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar empresa:', error);
        } finally {
            setLoading(false);
        }
    }, [setEmpresa]);

    const fetchNomeEmpresa = useCallback(async () => {
        try {
            const result = await EmpresaService.buscarNome();
            if (result.data) {
                setNomeEmpresa(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar nome da empresa:', error);
        }
    }, []);

    useEffect(() => {
        fetchNomeEmpresa();
    }, [fetchNomeEmpresa]);

    const value: EmpresaContextType = {
        empresa,
        nomeEmpresa,
        loading,
        refreshEmpresa,
        setEmpresa,
    };

    return (
        <EmpresaContext.Provider value={value}>
            {children}
        </EmpresaContext.Provider>
    );
};

export default EmpresaContext;
