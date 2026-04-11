import { apiGet, apiPostWithResponse, createCrudService, PageResponse } from '../../services/apiService';

export interface MarcaVeiculoDTO {
    id?: string;
    nome: string;
}

const marcaVeiculoCrud = createCrudService<MarcaVeiculoDTO>('/api/marcas-veiculos', 'marca de veículo');

export const searchMarcasVeiculos = marcaVeiculoCrud.searchAdvanced;
export const getMarcaVeiculoById = marcaVeiculoCrud.getById;
export const createMarcaVeiculo = marcaVeiculoCrud.create;
export const updateMarcaVeiculo = marcaVeiculoCrud.update;
export const deleteMarcaVeiculo = marcaVeiculoCrud.delete;

export const createMarcaVeiculoWithResponse = async (marca: MarcaVeiculoDTO) => {
    return apiPostWithResponse<MarcaVeiculoDTO, MarcaVeiculoDTO>('/api/marcas-veiculos', marca, 'Erro ao criar marca de veículo');
};

export const searchMarcas = async (search: string = ''): Promise<{ data?: MarcaVeiculoDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        page: '0',
        size: '100',
    });
    if (search) {
        params.append('search', `nome=='*${search}*'`);
    }

    const result = await apiGet<PageResponse<MarcaVeiculoDTO>>(
        `/api/marcas-veiculos?${params}`,
        'Erro ao buscar marcas'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};
