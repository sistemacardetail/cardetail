import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDialogs } from '../hooks/useDialogs';
import ConfirmDialog from '../components/ConfirmDialog';

interface UnsavedChangesContextType {
    isDirty: boolean;
    setIsDirty: (dirty: boolean) => void;
    registerDirtyCheck: (checkFn: () => boolean) => void;
    unregisterDirtyCheck: () => void;
    navigateWithCheck: (path: string) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const dialogs = useDialogs();
    const [isDirty, setIsDirtyState] = useState(false);
    const dirtyCheckRef = useRef<(() => boolean) | null>(null);

    const setIsDirty = useCallback((dirty: boolean) => {
        setIsDirtyState(dirty);
    }, []);

    const registerDirtyCheck = useCallback((checkFn: () => boolean) => {
        dirtyCheckRef.current = checkFn;
    }, []);

    const unregisterDirtyCheck = useCallback(() => {
        dirtyCheckRef.current = null;
        setIsDirtyState(false);
    }, []);

    const checkIsDirty = useCallback(() => {
        if (dirtyCheckRef.current) {
            return dirtyCheckRef.current();
        }
        return isDirty;
    }, [isDirty]);

    const navigateWithCheck = useCallback(async (path: string) => {
        if (checkIsDirty()) {
            const confirmed = await dialogs.open(ConfirmDialog, {
                title: 'Alterações não salvas',
                message: 'Deseja realmente sair? As informações não salvas serão perdidas.',
                confirmText: 'Sair',
                cancelText: 'Continuar editando',
                confirmColor: 'warning',
            });
            if (confirmed) {
                setIsDirtyState(false);
                navigate(path);
            }
        } else {
            navigate(path);
        }
    }, [checkIsDirty, dialogs, navigate]);

    return (
        <UnsavedChangesContext.Provider
            value={{
                isDirty,
                setIsDirty,
                registerDirtyCheck,
                unregisterDirtyCheck,
                navigateWithCheck,
            }}
        >
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChangesContext() {
    const context = useContext(UnsavedChangesContext);
    if (!context) {
        throw new Error('Não foi possível obter informações do contexto');
    }
    return context;
}
