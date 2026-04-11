import { apiGet, PageResponse } from '../services/apiService';

export interface ufDTO {
    id: string;
    sigla: string;
    nome: string;
}

export interface CidadeDTO {
    id: string;
    nome: string;
    uf: ufDTO;
}

export const searchCidades = async (
    search: string = ''
): Promise<{ data?: CidadeDTO[]; error?: string }> => {
    const searchTerm = search ? `*${search}*` : '';
    const rsqlQuery = search
        ? `nome=='${searchTerm}',uf.sigla=='${searchTerm}',uf.nome=='${searchTerm}'`
        : '';

    const params = new URLSearchParams({
        page: '0',
        size: '20',
        search: rsqlQuery,
        sort: 'nome,asc',
    });

    const result = await apiGet<PageResponse<CidadeDTO>>(
        `/api/cidades?${params}`,
        'Erro ao buscar cidades'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};

export const findByNomeUf = async (
    nomeCidade: string, uf: string
): Promise<{ data?: CidadeDTO; error?: string }> => {

    const params = new URLSearchParams({
        uf: uf,
        nome: nomeCidade,
    });

    const result = await apiGet<CidadeDTO>(
        `/api/cidades/find-by-nome-and-uf?${params}`,
        'Não foi possível encontrar a cidade'
    );

    if (result.data) {
        return { data: result.data };
    }

    return { error: result.error };
};