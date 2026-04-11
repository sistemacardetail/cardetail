// Tipos genéricos para respostas da API
export interface PageResponse<T> {
    content: T[];
    page: Page;
}

export interface Page {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ApiError {
    field: string | null;
    message: string;
    rejectedValue: any;
}

export interface ApiErrorResponse {
    error?: string;
    status?: number;
    timestamp?: string;
    errors?: ApiError[];
}

export interface ApiResult<T> {
    data?: T;
    error?: string;
    errors?: ApiError[];
    status?: number;
    isForbidden?: boolean;
    isUnauthorized?: boolean;
}

export interface ApiMutationResult {
    success?: boolean;
    error?: string;
    errors?: ApiError[];
    status?: number;
    isForbidden?: boolean;
    isUnauthorized?: boolean;
}

let onUnauthorized: (() => void) | null = null;
let onForbidden: ((message: string) => void) | null = null;

export const setAuthErrorHandlers = (
    unauthorizedHandler: () => void,
    forbiddenHandler: (message: string) => void
) => {
    onUnauthorized = unauthorizedHandler;
    onForbidden = forbiddenHandler;
};

// Configuração padrão de headers
const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

// Função auxiliar para tratar erros
const handleApiError = async (response: Response, defaultMessage: string): Promise<ApiErrorResponse & { status: number }> => {
    const status = response.status;

    // Tratamento de erro 401 (não autenticado)
    if (status === 401) {
        if (onUnauthorized) {
            onUnauthorized();
        }
        return {
            error: 'Sessão expirada. Faça login novamente.',
            status,
        };
    }

    // Tratamento de erro 403 (sem permissão)
    if (status === 403) {
        let forbiddenMessage = 'Usuário não possui permissão.';
        try {
            const text = await response.text();
            if (text) {
                const errorData = JSON.parse(text);
                forbiddenMessage = errorData?.errors?.[0]?.message
                    || errorData?.error
                    || errorData?.message
                    || forbiddenMessage;
            }
        } catch {
            // Mantém a mensagem padrão
        }
        if (onForbidden) {
            onForbidden(forbiddenMessage);
        }
        return {
            error: forbiddenMessage,
            status,
        };
    }

    try {
        // Verifica se há conteúdo na resposta
        const text = await response.text();
        if (!text) {
            return { error: defaultMessage, status };
        }

        // Tenta fazer parse do JSON
        const errorData = JSON.parse(text);

        const errorMessage = errorData?.errors?.[0]?.message
            || errorData?.error
            || errorData?.message
            || defaultMessage;
        return {
            error: errorMessage,
            errors: errorData?.errors,
            status,
        };
    } catch {
        return { error: defaultMessage, status };
    }
};

// Funções genéricas de API
export const apiGet = async <T>(url: string, defaultErrorMessage: string): Promise<ApiResult<T>> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: defaultHeaders,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        // Tratar resposta 204 No Content (sem corpo)
        if (response.status === 204) {
            return { data: undefined as T };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

export const apiPost = async <T>(url: string, body: T, defaultErrorMessage: string): Promise<ApiMutationResult> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

// Versao do POST que retorna os dados criados
export const apiPostWithResponse = async <T, R = T>(url: string, body: T, defaultErrorMessage: string): Promise<ApiResult<R> & { success?: boolean }> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Erro na requisicao:', error);
        return { error: 'Erro de conexao' };
    }
};

export const apiPut = async <T>(url: string, body: T, defaultErrorMessage: string): Promise<ApiMutationResult> => {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

export const apiDelete = async (url: string, defaultErrorMessage: string): Promise<ApiMutationResult> => {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: defaultHeaders,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

export const apiPatch = async <T>(url: string, body: T, defaultErrorMessage: string): Promise<ApiMutationResult> => {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return {
                error: errorData.error,
                errors: errorData.errors,
                status: errorData.status,
                isForbidden: errorData.status === 403,
                isUnauthorized: errorData.status === 401,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

export const apiGetBlob = async (url: string, defaultErrorMessage: string): Promise<{ data?: Blob; error?: string }> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await handleApiError(response, defaultErrorMessage);
            return { error: errorData.error };
        }

        const blob = await response.blob();
        return { data: blob };
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { error: 'Erro de conexão' };
    }
};

// Interface para parâmetros de busca avançada
export interface AdvancedSearchParams {
    page?: number;
    size?: number;
    search?: string;
    sort: readonly { field: string; sort: 'asc' | 'desc' | null | undefined }[];
}

// Factory para criar serviços CRUD
export const createCrudService = <T extends { id?: string }, ListT = T>(
    baseUrl: string,
    entityName: string
) => {
    // Função auxiliar para construir parâmetros de busca
    const buildParams = (params: AdvancedSearchParams): URLSearchParams => {
        const urlParams = new URLSearchParams();
        urlParams.set('page', (params.page ?? 0).toString());
        urlParams.set('size', (params.size ?? 10).toString());

        if (params.search) {
            urlParams.set('search', params.search);
        }

        if (params.sort && params.sort.length > 0) {
            params.sort.forEach(s => {
                if (s.field && s.sort) {
                    urlParams.append('sort', `${s.field},${s.sort}`);
                }
            });
        }

        return urlParams;
    };

    return {
        search: async (
            search: string = '',
            page: number = 0,
            size: number = 10
        ): Promise<ApiResult<PageResponse<ListT>>> => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
            });
            if (search) {
                params.append('search', search);
            }
            return apiGet<PageResponse<ListT>>(
                `${baseUrl}?${params}`,
                `Erro ao buscar ${entityName}`
            );
        },

        searchAdvanced: async (
            params: AdvancedSearchParams
        ): Promise<ApiResult<PageResponse<ListT>>> => {
            const urlParams = buildParams(params);
            return apiGet<PageResponse<ListT>>(
                `${baseUrl}?${urlParams}`,
                `Erro ao buscar ${entityName}`
            );
        },

        searchDTO: async (
            search: string = '',
            page: number = 0,
            size: number = 10
        ): Promise<ApiResult<PageResponse<ListT>>> => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
            });
            if (search) {
                params.append('search', search);
            }
            return apiGet<PageResponse<ListT>>(
                `${baseUrl}/list?${params}`,
                `Erro ao buscar ${entityName}`
            );
        },

        searchDTOAdvanced: async (
            params: AdvancedSearchParams
        ): Promise<ApiResult<PageResponse<ListT>>> => {
            const urlParams = buildParams(params);
            return apiGet<PageResponse<ListT>>(
                `${baseUrl}/list?${urlParams}`,
                `Erro ao buscar ${entityName}`
            );
        },

        getById: async (id: string): Promise<ApiResult<T>> => {
            return apiGet<T>(`${baseUrl}/${id}`, `Erro ao buscar ${entityName}`);
        },

        getDTO: async (id: string): Promise<ApiResult<T>> => {
            return apiGet<T>(`${baseUrl}/${id}/dto`, `Erro ao buscar ${entityName}`);
        },

        create: async (entity: T): Promise<ApiMutationResult> => {
            return apiPost<T>(baseUrl, entity, `Erro ao criar ${entityName}`);
        },

        update: async (id: string, entity: T): Promise<ApiMutationResult> => {
            return apiPut<T>(`${baseUrl}/${id}`, entity, `Erro ao atualizar ${entityName}`);
        },

        delete: async (id: string): Promise<ApiMutationResult> => {
            return apiDelete(`${baseUrl}/${id}`, `Erro ao excluir ${entityName}`);
        },
    };
};

// Utilitário para formatar mensagens de erro
export const formatApiErrors = (errors?: ApiError[]): string => {
    if (!errors || errors.length === 0) return '';
    return errors.map((err) => err.message).join('; ');
};

// Utilitário para extrair erros de campos
export const extractFieldErrors = (errors?: ApiError[]): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    if (errors) {
        errors.forEach((err) => {
            if (err.field) {
                fieldErrors[err.field] = err.message;
            }
        });
    }
    return fieldErrors;
};
