import {
    apiDelete,
    apiGet,
    ApiMutationResult,
    apiPostWithResponse,
    apiPut,
    ApiResult
} from '../../services/apiService';

export interface TelefoneDTO {
    id?: string;
    ddd: string;
    numero: string;
}

export interface EmpresaDTO {
    id: string;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    cnpjFormatado: string;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    idCidade: string | null;
    cidade: string | null;
    estado: string | null;
    enderecoCompleto: string;
    telefone: string | null;
    temLogo: boolean;
}

export interface EmpresaCreateDTO {
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    idCidade?: string | null;
    telefone?: TelefoneDTO;
}

const BASE_URL = '/api/empresas';

export interface CnpjConsultaDTO {
    nomeFantasia: string;
    razaoSocial: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    telefone: string;
}

export const EmpresaService = {
    consultarCnpj: async (cnpj: string): Promise<ApiResult<CnpjConsultaDTO>> => {
        const cnpjLimpo = cnpj.replace(/\D/g, '');

        try {
            const response = await fetch(`https://kitana.opencnpj.com/cnpj/${cnpjLimpo}`);

            if (!response.ok) {
                return { error: 'Não foi possível encontrar dados do CNPJ informado.' };
            }

            const result = await response.json();

            if (!result.success) {
                return { error: result.message || 'CNPJ não encontrado na base de dados.' };
            }

            return { data: result.data as CnpjConsultaDTO };
        } catch {
            return { error: 'Erro ao consultar CNPJ. Verifique sua conexão.' };
        }
    },

    buscar: async (): Promise<ApiResult<EmpresaDTO | null>> => {
        return apiGet<EmpresaDTO | null>(BASE_URL, 'Erro ao buscar dados da empresa');
    },

    buscarNome: async (): Promise<ApiResult<string | null>> => {
        try {
            const response = await fetch(`${BASE_URL}/nome`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 204) {
                    return { data: null };
                }
                return { error: 'Erro ao buscar nome da empresa' };
            }

            const text = await response.text();
            return { data: text || null };
        } catch (error) {
            console.error('Erro ao buscar nome da empresa:', error);
            return { error: 'Erro de conexão' };
        }
    },

    buscarPorId: async (id: string): Promise<ApiResult<EmpresaDTO>> => {
        return apiGet<EmpresaDTO>(`${BASE_URL}/${id}`, 'Erro ao buscar empresa');
    },

    criar: async (dto: EmpresaCreateDTO): Promise<ApiResult<EmpresaDTO>> => {
        return apiPostWithResponse<EmpresaCreateDTO, EmpresaDTO>(BASE_URL, dto, 'Erro ao criar empresa');
    },

    atualizar: async (dto: EmpresaCreateDTO): Promise<ApiResult<EmpresaDTO>> => {
        const result = await apiPut<EmpresaCreateDTO>(BASE_URL, dto, 'Erro ao atualizar empresa');
        if (result.error) {
            return {
                error: result.error,
                errors: result.errors,
                status: result.status,
                isForbidden: result.isForbidden,
                isUnauthorized: result.isUnauthorized,
            };
        }
        // Após atualizar, buscar os dados atualizados
        return EmpresaService.buscar() as Promise<ApiResult<EmpresaDTO>>;
    },

    uploadLogo: async (id: string, arquivo: File): Promise<ApiMutationResult> => {
        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);

            const response = await fetch(`${BASE_URL}/${id}/logo`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                if (!text) {
                    return { error: 'Erro ao fazer upload do logo' };
                }
                const errorData = JSON.parse(text);
                return {
                    error: errorData?.errors?.[0]?.message || errorData?.error || errorData?.message || 'Erro ao fazer upload do logo',
                    errors: errorData?.errors,
                };
            }

            return { success: true };
        } catch (error) {
            console.error('Erro na requisição:', error);
            return { error: 'Erro de conexão' };
        }
    },

    removerLogo: async (id: string): Promise<ApiMutationResult> => {
        return apiDelete(`${BASE_URL}/${id}/logo`, 'Erro ao remover logo');
    },

    getLogoUrl: (id: string): string => {
        return `${BASE_URL}/${id}/logo`;
    },
};
