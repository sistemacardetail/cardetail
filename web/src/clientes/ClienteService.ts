import { apiPostWithResponse, createCrudService } from '../services/apiService';
import { CorVeiculoDTO, ModeloVeiculoDTO } from '../cadastros';

export interface TelefoneDTO {
    id?: string;
    ddd: string;
    numero: string;
}

export interface TelefoneClienteDTO {
    id?: string;
    telefone: TelefoneDTO;
    principal: boolean;
}

export interface VeiculoDTO {
    id?: string;
    modelo: ModeloVeiculoDTO;
    cor: CorVeiculoDTO;
    placa: string | null;
    observacao?: string;
    semPlaca: boolean;
}

export interface ClienteDTO {
    id?: string;
    nome: string;
    observacao?: string;
    ativo: boolean;
    telefones: TelefoneClienteDTO[];
    veiculos: VeiculoDTO[];
}

export interface VeiculoListDTO {
    id: string;
    modelo: string;
    cor: string;
    marca: string;
    tipo: string;
    idTipo: string;
    placa: string;
    observacao: string;
}

export interface ClienteListDTO {
    id: string;
    nome: string;
    status: string;
    telefonePrincipal: string;
    observacao?: string;
    veiculos: VeiculoListDTO[];
}

const clienteCrud = createCrudService<ClienteDTO, ClienteListDTO>('/api/clientes', 'cliente');

export const searchClientes = clienteCrud.searchDTOAdvanced;
export const getClienteById = clienteCrud.getById;
export const createCliente = clienteCrud.create;
export const updateCliente = clienteCrud.update;
export const deleteCliente = clienteCrud.delete;

// Versão do create que retorna o cliente criado (usado para retornar com veículo selecionado)
export const createClienteWithResponse = async (cliente: ClienteDTO) => {
    return apiPostWithResponse<ClienteDTO, ClienteDTO>('/api/clientes', cliente, 'Erro ao criar cliente');
};
