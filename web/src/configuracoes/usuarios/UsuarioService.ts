import {
    apiDelete,
    apiGet,
    ApiMutationResult,
    apiPost,
    apiPostWithResponse,
    apiPut,
    ApiResult
} from '../../services/apiService';

export interface PerfilResumo {
    id: number;
    nome: string;
    nivel: number;
}

export interface UsuarioDTO {
    id: string;
    login: string;
    nome: string;
    perfil: PerfilResumo;
    ativo: boolean;
    admin: boolean;
    lastLogin: string | null;
    permissoes: string[];
}

export interface UsuarioCreateDTO {
    login: string;
    nome: string;
    senha: string;
    perfilId: number;
    ativo: boolean;
}

export interface UsuarioUpdateDTO {
    login: string;
    nome: string;
    perfilId: number;
    ativo: boolean;
}

export interface AlterarSenhaDTO {
    senhaAtual: string;
    novaSenha: string;
    confirmarSenha: string;
}

export interface ResetarSenhaDTO {
    novaSenha: string;
}

export interface PermissaoDTO {
    id: number;
    codigo: string;
    descricao: string;
    modulo: string;
}

export interface PerfilDTO {
    id: number;
    nome: string;
    descricao: string;
    nivel: number;
    ativo: boolean;
    permissoes: PermissaoDTO[];
}

export interface PerfilCreateDTO {
    nome: string;
    descricao: string;
    nivel: number;
    ativo: boolean;
    permissoesIds: number[];
}

const BASE_URL = '/api/usuarios';
const PERFIS_URL = '/api/perfis';

export const UsuarioService = {
    listar: async (): Promise<ApiResult<UsuarioDTO[]>> => {
        return apiGet<UsuarioDTO[]>(BASE_URL, 'Erro ao listar usuários');
    },

    listarAtivos: async (): Promise<ApiResult<UsuarioDTO[]>> => {
        return apiGet<UsuarioDTO[]>(`${BASE_URL}/ativos`, 'Erro ao listar usuários ativos');
    },

    buscarPorId: async (id: string): Promise<ApiResult<UsuarioDTO>> => {
        return apiGet<UsuarioDTO>(`${BASE_URL}/${id}`, 'Erro ao buscar usuário');
    },

    buscar: async (termo: string): Promise<ApiResult<UsuarioDTO[]>> => {
        return apiGet<UsuarioDTO[]>(`${BASE_URL}/buscar?termo=${encodeURIComponent(termo)}`, 'Erro ao buscar usuários');
    },

    getUsuarioLogado: async (): Promise<ApiResult<UsuarioDTO>> => {
        return apiGet<UsuarioDTO>(`${BASE_URL}/me`, 'Erro ao buscar usuário logado');
    },

    criar: async (dto: UsuarioCreateDTO): Promise<ApiResult<UsuarioDTO>> => {
        return apiPostWithResponse<UsuarioCreateDTO, UsuarioDTO>(BASE_URL, dto, 'Erro ao criar usuário');
    },

    atualizar: async (id: string, dto: UsuarioUpdateDTO): Promise<ApiMutationResult> => {
        return apiPut<UsuarioUpdateDTO>(`${BASE_URL}/${id}`, dto, 'Erro ao atualizar usuário');
    },

    excluir: async (id: string): Promise<ApiMutationResult> => {
        return apiDelete(`${BASE_URL}/${id}`, 'Erro ao excluir usuário');
    },

    ativar: async (id: string): Promise<ApiMutationResult> => {
        return apiPost<{}>(`${BASE_URL}/${id}/ativar`, {}, 'Erro ao ativar usuário');
    },

    desativar: async (id: string): Promise<ApiMutationResult> => {
        return apiPost<{}>(`${BASE_URL}/${id}/desativar`, {}, 'Erro ao desativar usuário');
    },

    desbloquear: async (id: string): Promise<ApiMutationResult> => {
        return apiPost<{}>(`${BASE_URL}/${id}/desbloquear`, {}, 'Erro ao desbloquear usuário');
    },

    resetarSenha: async (id: string, dto: ResetarSenhaDTO): Promise<ApiMutationResult> => {
        return apiPost<ResetarSenhaDTO>(`${BASE_URL}/${id}/resetar-senha`, dto, 'Erro ao resetar senha');
    },

    alterarSenha: async (dto: AlterarSenhaDTO): Promise<ApiMutationResult> => {
        return apiPost<AlterarSenhaDTO>(`${BASE_URL}/alterar-senha`, dto, 'Erro ao alterar senha');
    },
};

export const PerfilService = {
    listar: async (): Promise<ApiResult<PerfilDTO[]>> => {
        return apiGet<PerfilDTO[]>(PERFIS_URL, 'Erro ao listar perfis');
    },

    listarAtivos: async (): Promise<ApiResult<PerfilDTO[]>> => {
        return apiGet<PerfilDTO[]>(`${PERFIS_URL}/ativos`, 'Erro ao listar perfis ativos');
    },

    buscarPorId: async (id: string): Promise<ApiResult<PerfilDTO>> => {
        return apiGet<PerfilDTO>(`${PERFIS_URL}/${id}`, 'Erro ao buscar perfil');
    },

    criar: async (dto: PerfilCreateDTO): Promise<ApiResult<PerfilDTO>> => {
        return apiPostWithResponse<PerfilCreateDTO, PerfilDTO>(PERFIS_URL, dto, 'Erro ao criar perfil');
    },

    atualizar: async (id: string, dto: PerfilCreateDTO): Promise<ApiMutationResult> => {
        return apiPut<PerfilCreateDTO>(`${PERFIS_URL}/${id}`, dto, 'Erro ao atualizar perfil');
    },

    excluir: async (id: number): Promise<ApiMutationResult> => {
        return apiDelete(`${PERFIS_URL}/${id}`, 'Erro ao excluir perfil');
    },

    listarPermissoes: async (): Promise<ApiResult<PermissaoDTO[]>> => {
        return apiGet<PermissaoDTO[]>(`${PERFIS_URL}/permissoes`, 'Erro ao listar permissões');
    },

    listarPermissoesAgrupadas: async (): Promise<ApiResult<Record<string, PermissaoDTO[]>>> => {
        return apiGet<Record<string, PermissaoDTO[]>>(`${PERFIS_URL}/permissoes/agrupadas`, 'Erro ao listar permissões');
    },
};
