import { TipoVeiculoDTO } from '../cadastros';
import { apiGet, createCrudService } from '../services/apiService';
import { ServicoDTO } from '../servicos';

// Tipo do relacionamento Pacote-Servico
export interface PacoteServicoDTO {
    id?: string;
    servico: ServicoDTO;
}

// DTO principal do Pacote
export interface PacoteDTO {
    id?: string;
    nome: string;
    descricao: string;
    observacao?: string;
    valor: number;
    tempoExecucaoMin: number;
    ativo: boolean;
    tipoVeiculo: TipoVeiculoDTO;
    servicos: PacoteServicoDTO[];
    dataCriacao?: string;
}

// DTO para listagem
export interface PacoteListDTO {
    id: string;
    nome: string;
    valor: number;
    tempoExecucaoMin: number;
    ativo: boolean;
    tipoVeiculo: string;
}

// Serviço CRUD genérico
const pacoteCrud = createCrudService<PacoteDTO, PacoteListDTO>('/api/pacotes', 'pacote');

export const searchPacotes = pacoteCrud.searchAdvanced;
export const getPacoteById = pacoteCrud.getById;
export const createPacote = pacoteCrud.create;
export const updatePacote = pacoteCrud.update;
export const deletePacote = pacoteCrud.delete;

export const searchPacotesAgendamento = async (
    idTipoVeiculo: string, search: string = ''
): Promise<{ data?: PacoteDTO[]; error?: string }> => {
    const params = new URLSearchParams();
    if (search?.trim() !== '') {
        params.append('nome', search);
    }

    const url = params.toString() !== ''
        ? `/api/pacotes/agendamento/${idTipoVeiculo}?${params.toString()}`
        : `/api/pacotes/agendamento/${idTipoVeiculo}`;

    const result = await apiGet<PacoteDTO[]>(url, 'Erro ao buscar pacotes');

    if (result.data?.length) {
        return { data: result.data };
    }

    return { error: result.error };
};