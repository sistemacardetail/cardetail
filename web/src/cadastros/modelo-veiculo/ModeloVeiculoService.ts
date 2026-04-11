import { apiGet, apiPostWithResponse, createCrudService, PageResponse } from '../../services/apiService';
import { MarcaVeiculoDTO } from '../marca-veiculo/MarcaVeiculoService';
import { TipoVeiculoDTO } from '../tipo-veiculo/TipoVeiculoService';

export interface ModeloVeiculoDTO {
    id?: string;
    nome: string;
    marca: MarcaVeiculoDTO;
    tipo: TipoVeiculoDTO;
}

const modeloVeiculoCrud = createCrudService<ModeloVeiculoDTO>('/api/modelos-veiculos', 'modelo de veículo');

export const searchModelosVeiculos = modeloVeiculoCrud.searchAdvanced;
export const getModeloVeiculoById = modeloVeiculoCrud.getById;
export const createModeloVeiculo = modeloVeiculoCrud.create;
export const updateModeloVeiculo = modeloVeiculoCrud.update;
export const deleteModeloVeiculo = modeloVeiculoCrud.delete;

export const createModeloVeiculoWithResponse = async (modelo: ModeloVeiculoDTO) => {
    return apiPostWithResponse<ModeloVeiculoDTO, ModeloVeiculoDTO>('/api/modelos-veiculos', modelo, 'Erro ao criar modelo de veículo');
};

export const searchModelos = async (search: string = ''): Promise<{ data?: ModeloVeiculoDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        page: '0',
        size: '10',
    });
    if (search) {
        params.append('search', `nome=='*${search}*',marca.nome=='*${search}*'`);
    }

    const result = await apiGet<PageResponse<ModeloVeiculoDTO>>(
        `/api/modelos-veiculos?${params}`,
        'Erro ao buscar modelos'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};