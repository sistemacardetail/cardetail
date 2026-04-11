import { apiGet, createCrudService, PageResponse } from '../../services/apiService';

export interface TipoVeiculoDTO {
    id: string;
    descricao: string;
}

const tipoVeiculoCrud = createCrudService<TipoVeiculoDTO>('/api/tipos-veiculos', 'tipo de veículo');

export const searchTiposVeiculos = tipoVeiculoCrud.searchAdvanced;
export const getTipoVeiculoById = tipoVeiculoCrud.getById;
export const createTipoVeiculo = tipoVeiculoCrud.create;
export const updateTipoVeiculo = tipoVeiculoCrud.update;
export const deleteTipoVeiculo = tipoVeiculoCrud.delete;

export const searchTipos = async (search: string = ''): Promise<{ data?: TipoVeiculoDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        page: '0',
        size: '100',
    });
    if (search) {
        params.append('search', `descricao=='*${search}*'`);
    }

    const result = await apiGet<PageResponse<TipoVeiculoDTO>>(
        `/api/tipos-veiculos?${params}`,
        'Erro ao buscar tipos de veículos'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};
