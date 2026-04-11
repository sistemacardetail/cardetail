import { createCrudService } from '../services/apiService';
import { TipoVeiculoDTO } from '../cadastros';
import { TelefoneDTO } from '../configuracoes';

export interface ServicoTerceirizadoTipoVeiculoDTO {
    id?: string;
    tipo: TipoVeiculoDTO;
}

export interface FornecedorServicoDTO {
    id?: string;
    nome: string;
    telefone?: TelefoneDTO;
}

export interface ServicoTerceirizadoDTO {
    id?: string;
    nome: string;
    descricao?: string;
    observacao?: string;
    valor?: number;
    tempoExecucaoMin?: number;
    ativo: boolean;
    tiposVeiculos: ServicoTerceirizadoTipoVeiculoDTO[];
    fornecedor?: FornecedorServicoDTO;
    dataCriacao?: string;
}

export interface ServicoTerceirizadoListDTO {
    id: string;
    nome: string;
    ativo: boolean;
    tiposVeiculos: string[];
    fornecedor?: FornecedorServicoDTO;
}

const servicoCrud = createCrudService<ServicoTerceirizadoDTO, ServicoTerceirizadoListDTO>(
    '/api/servicos-terceirizados', 'serviço terceirizado');

export const searchServicosTerceirizados = servicoCrud.searchAdvanced;
export const getServicoTerceirizadoById = servicoCrud.getById;
export const createServicoTerceirizado = servicoCrud.create;
export const updateServicoTerceirizado = servicoCrud.update;
export const deleteServicoTerceirizado = servicoCrud.delete;

const escapeRsql = (value: string): string => value.replace(/'/g, "''");

export const searchServicosTerceirizadosAgendamento = async (
    idTipoVeiculo: string,
    search: string = ''
): Promise<{ data?: ServicoTerceirizadoListDTO[]; error?: string }> => {
    const filters = [
        'ativo==true',
        `tiposVeiculos.tipo.id=='${escapeRsql(idTipoVeiculo)}'`,
    ];

    if (search?.trim() !== '') {
        filters.push(`nome=='*${escapeRsql(search.trim())}*'`);
    }

    const result = await searchServicosTerceirizados({
        page: 0,
        size: 100,
        search: filters.join(';'),
        sort: [{ field: 'nome', sort: 'asc' }],
    });

    if (result.data) {
        return { data: result.data.content };
    }

    return { error: result.error };
};
