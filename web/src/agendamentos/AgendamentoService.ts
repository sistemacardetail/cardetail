import {
    ApiError,
    apiGet,
    apiPatch,
    apiPostWithResponse,
    createCrudService,
    PageResponse
} from '../services/apiService';
import { ClienteDTO, VeiculoDTO } from '../clientes/ClienteService';
import { PacoteDTO } from '../pacotes';
import { ServicoDTO } from '../servicos';
import { OrcamentoDTO } from '../orcamentos';
import { StatusPagamento } from './AgendamentoPagamentoService';
import { ServicoTerceirizadoDTO } from '../servicos-terceirizados';

export type { StatusPagamento } from './AgendamentoPagamentoService';

export type AgendamentoStatus = 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface AgendamentoServicoDTO {
    id?: string;
    servico: ServicoDTO | null;
    servicoTerceirizado?: ServicoTerceirizadoDTO | null;
    tipoServico?: 'INTERNO' | 'TERCEIRIZADO';
    tempoExecucaoMin?: number;
    valor?: number;
}

export interface AgendamentoServicoTerceirizadoDTO {
    id?: string;
    servicoTerceirizado?: ServicoTerceirizadoDTO | null;
    servico?: ServicoTerceirizadoDTO | null;
    valor?: number;
}

export interface AgendamentoDTO {
    id?: string;
    numero?: number;
    cliente?: ClienteDTO;
    veiculo: VeiculoDTO;
    valor: number;
    valorDesconto: number;
    dataPrevisaoInicio?: string;
    dataPrevisaoFim?: string;
    pacote: PacoteDTO;
    valorPacote: number;
    servicos: AgendamentoServicoDTO[];
    servicosTerceirizados?: AgendamentoServicoTerceirizadoDTO[];
    observacao?: string;
    dataCriacao?: string;
    status?: AgendamentoStatus;
    statusPagamento?: StatusPagamento;
    orcamento?: OrcamentoDTO;
    valorPagoTotal?: number;
    saldoRestante?: number;
    percentualPago?: number;
}

export const normalizeAgendamentoForForm = (agendamento: Partial<AgendamentoDTO>): Partial<AgendamentoDTO> => {
    const getServicoTerceirizadoFromListaTerceirizada = (item: any): ServicoTerceirizadoDTO | null =>
        item?.servicoTerceirizado ?? item?.servico ?? null;

    const servicosInternos = (agendamento.servicos || [])
        .filter((item) => !!item?.servico)
        .map((item) => ({
            id: item.id,
            servico: item.servico,
            valor: item.valor,
            tipoServico: 'INTERNO' as const,
            tempoExecucaoMin: item.tempoExecucaoMin ?? item.servico?.tempoExecucaoMin,
        }));

    const servicosTerceirizadosSeparados = (agendamento.servicosTerceirizados || [])
        .filter((item) => !!getServicoTerceirizadoFromListaTerceirizada(item))
        .map((item) => {
            const servicoTerceirizado = getServicoTerceirizadoFromListaTerceirizada(item);
            return {
                id: item.id,
                servico: null,
                servicoTerceirizado,
                valor: item.valor ?? servicoTerceirizado?.valor ?? 0,
                tipoServico: 'TERCEIRIZADO' as const,
                tempoExecucaoMin: servicoTerceirizado?.tempoExecucaoMin ?? 0,
            };
        });

    const servicosTerceirizadosNoArray = (agendamento.servicosTerceirizados || []).length > 0
        ? []
        : (agendamento.servicos || [])
            .filter((item) => item?.tipoServico === 'TERCEIRIZADO' || !!item?.servicoTerceirizado)
            .map((item) => {
                const servicoTerceirizado = item?.servicoTerceirizado ?? null;
                return {
                    id: item.id,
                    servico: null,
                    servicoTerceirizado,
                    valor: item.valor ?? servicoTerceirizado?.valor ?? 0,
                    tipoServico: 'TERCEIRIZADO' as const,
                    tempoExecucaoMin: item.tempoExecucaoMin ?? servicoTerceirizado?.tempoExecucaoMin ?? 0,
                };
            });

    return {
        ...agendamento,
        servicos: [...servicosInternos, ...servicosTerceirizadosNoArray, ...servicosTerceirizadosSeparados],
    };
};

export const splitAgendamentoServicosForApi = (agendamento: Partial<AgendamentoDTO>): AgendamentoDTO => {
    const getServicoTerceirizadoFromListaTerceirizada = (item: any): ServicoTerceirizadoDTO | null =>
        item?.servicoTerceirizado ?? item?.servico ?? null;

    const servicos = (agendamento.servicos || [])
        .filter((item) => item?.tipoServico !== 'TERCEIRIZADO' && !item?.servicoTerceirizado && !!item?.servico?.id)
        .map((item) => ({
            id: item.id,
            servico: { id: item.servico!.id } as ServicoDTO,
            valor: item.valor,
        }));

    const servicosTerceirizadosFromMerged = (agendamento.servicos || [])
        .filter((item) => item?.tipoServico === 'TERCEIRIZADO' || !!item?.servicoTerceirizado)
        .map((item) => ({
            constServicoTerceirizado: item.servicoTerceirizado ?? null,
            id: item.id,
            valor: item.valor,
        }))
        .map(({ constServicoTerceirizado, id, valor }) => ({
            id,
            servico: constServicoTerceirizado?.id
                ? ({ id: constServicoTerceirizado.id } as ServicoTerceirizadoDTO)
                : null,
            valor,
        }))
        .filter((item) => !!item.servico?.id);

    const servicosTerceirizados = servicosTerceirizadosFromMerged.length > 0
        ? servicosTerceirizadosFromMerged
        : (agendamento.servicosTerceirizados || [])
            .map((item) => {
                const servicoTerceirizado = getServicoTerceirizadoFromListaTerceirizada(item);
                return { ...item, servicoTerceirizado };
            })
            .filter((item) => !!item?.servicoTerceirizado?.id)
            .map((item) => ({
                id: item.id,
                servico: { id: item.servicoTerceirizado!.id } as ServicoTerceirizadoDTO,
                valor: item.valor,
            }));

    return {
        ...(agendamento as AgendamentoDTO),
        servicos,
        servicosTerceirizados,
    };
};

// DTO para listagem no calendário
export interface AgendamentoCalendarioDTO {
    id: string;
    numero: number;
    clienteId: string;
    clienteNome: string;
    veiculoId: string;
    veiculoModelo: string;
    veiculoPlaca: string;
    veiculoCor: string;
    pacoteId: string;
    pacoteNome: string;
    titulo: string;
    dataHoraInicio: string;
    dataHoraFim: string;
    status: AgendamentoStatus;
    valor: number;
    valorDesconto: number;
    observacao?: string;
    valorFinal: number;
    servicosNome: string[];
}

// DTO para listagem na grid
export interface AgendamentoListDTO {
    id: string;
    numero: number;
    clienteNome?: string;
    veiculo: VeiculoDTO;
    pacote: PacoteDTO;
    valorFinal: number;
    dataPrevisaoInicio?: string;
    dataPrevisaoFim?: string;
    servicos: AgendamentoServicoDTO[];
    status?: AgendamentoStatus;
    statusPagamento?: StatusPagamento;
}

// Servico CRUD generico
const agendamentoCrud = createCrudService<AgendamentoDTO, AgendamentoListDTO>('/api/agendamentos', 'agendamento');

export const searchAgendamentos = agendamentoCrud.searchAdvanced;
export const getAgendamentoById = agendamentoCrud.getById;
export const updateAgendamento = agendamentoCrud.update;
export const deleteAgendamento = agendamentoCrud.delete;

// Criar agendamento e retornar os dados com o numero gerado
export const createAgendamento = async (
    agendamento: AgendamentoDTO
): Promise<{ data?: AgendamentoDTO; success?: boolean; error?: string; errors?: ApiError[] }> => {
    return apiPostWithResponse<AgendamentoDTO, AgendamentoDTO>(
        '/api/agendamentos',
        agendamento,
        'Erro ao criar agendamento'
    );
};

export interface VeiculoClienteDTO {
    id: string;
    clienteId: string;
    clienteNome: string;
    clienteObservacao?: string;
    clienteTelefone?: string;
    modelo: string;
    marca: string;
    cor: string;
    placa: string;
    tipo: string;
    idTipo: string;
    observacao?: string;
}

export const searchVeiculosComCliente = async (
    search: string = ''
): Promise<{ data?: VeiculoClienteDTO[]; error?: string }> => {
    const searchTerm = search ? `*${search}*` : '';
    const filters = [
        `nome=='${searchTerm}'`,
        `veiculos.placa=='${searchTerm}'`,
        `veiculos.modelo.nome=='${searchTerm}'`
    ];
    if (/^\d+$/.test(search)) {
        filters.push(`telefones.telefone==*${searchTerm}*`);
    }

    const rsqlQuery = search
        ? `ativo==true;(${filters.join(',')})`
        : 'ativo==true';

    const params = new URLSearchParams({
        page: '0',
        size: '10',
        search: rsqlQuery
    });

    const result = await apiGet<PageResponse<VeiculoClienteDTO>>(
        `/api/clientes/veiculos?${params}`,
        'Erro ao buscar veículos'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};

// Buscar agendamentos para o calendário (por período)
export const searchAgendamentosCalendario = async (
    dataInicio: string,
    dataFim: string
): Promise<{ data?: AgendamentoCalendarioDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        dataInicio,
        dataFim,
    });

    return await apiGet<AgendamentoCalendarioDTO[]>(
        `/api/agendamentos/calendario?${params}`,
        'Erro ao buscar agendamentos do calendário'
    );
};

// Buscar agendamentos de um dia específico
export const searchAgendamentosDia = async (
    data: string
): Promise<{ data?: AgendamentoCalendarioDTO[]; error?: string }> => {
    return await apiGet<AgendamentoCalendarioDTO[]>(
        `/api/agendamentos/dia/${data}`,
        'Erro ao buscar agendamentos do dia'
    );
};

// Atualizar status do agendamento
export const updateAgendamentoStatus = async (
    id: string,
    status: AgendamentoStatus
): Promise<{ success?: boolean; error?: string }> => {
    return apiPatch(`/api/agendamentos/${id}/status`, { status }, 'Erro ao atualizar status');
};

// Atualizar datas do agendamento (drag & drop)
export const updateAgendamentoDatas = async (
    id: string,
    dataPrevisaoInicio: string,
    dataPrevisaoFim: string
): Promise<{ success?: boolean; error?: string }> => {
    return apiPatch(
        `/api/agendamentos/${id}/datas`,
        { dataPrevisaoInicio, dataPrevisaoFim },
        'Erro ao atualizar datas'
    );
};
