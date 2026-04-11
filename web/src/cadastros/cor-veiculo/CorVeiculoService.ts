import { apiGet, apiPostWithResponse, createCrudService, PageResponse } from '../../services/apiService';

export interface CorVeiculoDTO {
    id?: string;
    nome: string;
}

const corVeiculoCrud = createCrudService<CorVeiculoDTO>('/api/cores-veiculos', 'cor de veículo');

export const searchCoresVeiculos = corVeiculoCrud.searchAdvanced;
export const getCorVeiculoById = corVeiculoCrud.getById;
export const createCorVeiculo = corVeiculoCrud.create;
export const updateCorVeiculo = corVeiculoCrud.update;
export const deleteCorVeiculo = corVeiculoCrud.delete;

export const createCorVeiculoWithResponse = async (cor: CorVeiculoDTO) => {
    return apiPostWithResponse<CorVeiculoDTO, CorVeiculoDTO>('/api/cores-veiculos', cor, 'Erro ao criar cor de veículo');
};

export const searchCores = async (search: string = ''): Promise<{ data?: CorVeiculoDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        page: '0',
        size: '100',
    });
    if (search) {
        params.append('search', `nome=='*${search}*'`);
    }

    const result = await apiGet<PageResponse<CorVeiculoDTO>>(
        `/api/cores-veiculos?${params}`,
        'Erro ao buscar cores'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};
