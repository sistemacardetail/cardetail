import { LoginFormDTO } from '../dto/LoginFormDTO';
import { LoginResponseDTO } from '../dto/LoginResponseDTO';

let isAuthChecking = false;
let authPromise: Promise<boolean> | null = null;

export const authenticate = async (form: LoginFormDTO): Promise<LoginResponseDTO> => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            credentials: 'include',
            body: JSON.stringify(form),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Padroniza extração de mensagem de erro
            const errorMessage = errorData?.errors?.[0]?.message
                || errorData?.error
                || errorData?.errorMessage
                || errorData?.message
                || 'Não foi possível realizar o login, verifique as credenciais.';
            return {
                successMessage: null,
                errorMessage
            };
        }

        const data = await response.json().catch(() => ({}));

        clearAuthCache();

        return {
            successMessage: data.successMessage || 'Login realizado com sucesso!',
            errorMessage: null
        };

    } catch (error) {
        console.error('Erro na requisição de login:', error);
        return {
            successMessage: null,
            errorMessage: 'Não foi possível realizar o login. Erro de conexão.'
        };
    }
};

export const logout = async (): Promise<boolean> => {
    try {
        clearAuthCache();

        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

        clearLocalData();

        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.update();
            }
        }

        return response.ok;
    } catch (error) {
        console.error('Erro ao fazer logout:', error);

        clearLocalData();

        return false;
    }
};

export const verifyToken = async (): Promise<boolean> => {
    if (isAuthChecking && authPromise) {
        return authPromise;
    }

    isAuthChecking = true;
    authPromise = performTokenVerification();

    try {
        return await authPromise;
    } finally {
        isAuthChecking = false;
        authPromise = null;
    }
};

const performTokenVerification = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/validar-token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include'
        });

        const isValid = response.ok && response.status === 200;

        if (!isValid) {
            clearLocalData();
        }

        return isValid;
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        clearLocalData();
        return false;
    }
};

const clearAuthCache = () => {
    isAuthChecking = false;
    authPromise = null;
};

const clearLocalData = () => {
    try {
        localStorage.removeItem('username');
        sessionStorage.removeItem('dashboard_calendar_state');

        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            }).catch(console.warn);
        }
    } catch (error) {
        console.warn('Erro ao limpar dados locais:', error);
    }
};
