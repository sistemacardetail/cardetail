import { useEffect } from 'react';
import { useUnsavedChangesContext } from '../contexts/UnsavedChangesContext';

interface UseUnsavedChangesOptions {
    isDirty: boolean;
}

export function useUnsavedChanges({ isDirty }: UseUnsavedChangesOptions) {
    const { setIsDirty, registerDirtyCheck, unregisterDirtyCheck } = useUnsavedChangesContext();

    useEffect(() => {
        registerDirtyCheck(() => isDirty);
        return () => {
            unregisterDirtyCheck();
        };
    }, [isDirty, registerDirtyCheck, unregisterDirtyCheck]);

    useEffect(() => {
        setIsDirty(isDirty);
    }, [isDirty, setIsDirty]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
}
