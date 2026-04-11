import { apiGet, createCrudService } from '../services/apiService';
import { TipoVeiculoDTO } from '../cadastros';

// Tipo do relacionamento Serviço-TipoVeiculo
export interface ServicoTipoVeiculoDTO {
    id?: string;
    tipo: TipoVeiculoDTO;
}

// DTO principal do Serviço
export interface ServicoDTO {
    id?: string;
    nome: string;
    descricao?: string;
    observacao?: string;
    valor: number;
    tempoExecucaoMin: number;
    ativo: boolean;
    disponivelAgendamento: boolean;
    disponivelPacote: boolean;
    tiposVeiculos: ServicoTipoVeiculoDTO[];
    dataCriacao?: string;
}

// DTO para listagem (pode ser simplificado se necessário)
export interface ServicoListDTO {
    id: string;
    nome: string;
    valor: number;
    tempoExecucaoMin: number;
    ativo: boolean;
    disponivelAgendamento: boolean;
    disponivelPacote: boolean;
    tiposVeiculos: string[];
}

// Serviço CRUD genérico
const servicoCrud = createCrudService<ServicoDTO, ServicoListDTO>('/api/servicos', 'serviço');

export const searchServicos = servicoCrud.searchAdvanced;
export const getServicoById = servicoCrud.getById;
export const createServico = servicoCrud.create;
export const updateServico = servicoCrud.update;
export const deleteServico = servicoCrud.delete;

export const searchServicosPacote = async (
    search: string = '', idTipoVeiculo: string
): Promise<{ data?: ServicoDTO[]; error?: string }> => {
    const params = new URLSearchParams();
    if (search?.trim() !== '') {
        params.append('nome', search);
    }

    const url = params.toString() !== ''
        ? `/api/servicos/pacote/${idTipoVeiculo}?${params.toString()}`
        : `/api/servicos/pacote/${idTipoVeiculo}`;

    const result = await apiGet<ServicoDTO[]>(url, 'Erro ao buscar serviços para o pacote');

    if (result.data) {
        return { data: result.data };
    }

    return { error: result.error };
};

export const searchServicosAgendamento = async (
    idTipoVeiculo: string, search: string = '', idPacote: string = ''
): Promise<{ data?: ServicoDTO[]; error?: string }> => {
    const params = new URLSearchParams();
    if (search?.trim() !== '') {
        params.append('nome', search);
    }
    if (idPacote !== '') {
        params.append('idPacote', idPacote);
    }

    const url = params.toString() !== ''
        ? `/api/servicos/agendamento/${idTipoVeiculo}?${params.toString()}`
        : `/api/servicos/agendamento/${idTipoVeiculo}`;

    const result = await apiGet<ServicoDTO[]>(url, 'Erro ao buscar serviços');

    if (result.data) {
        return { data: result.data };
    }

    return { error: result.error };
};
