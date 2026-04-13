import {
    ApiError,
    apiGet,
    apiGetBlob,
    apiPatch,
    apiPost,
    apiPostWithResponse,
    createCrudService
} from '../services/apiService';
import { PacoteDTO } from '../pacotes';
import { ServicoDTO } from '../servicos';
import { ClienteDTO, ClienteListDTO, VeiculoDTO } from '../clientes/ClienteService';
import { ServicoTerceirizadoDTO } from '../servicos-terceirizados';

export type OrcamentoStatus = 'PENDENTE' | 'AGENDADO' | 'CANCELADO';

export interface OrcamentoServicoDTO {
    id?: string;
    servico: ServicoDTO | null;
    servicoTerceirizado?: ServicoTerceirizadoDTO | null;
    tipoServico?: 'INTERNO' | 'TERCEIRIZADO';
    tempoExecucaoMin?: number;
    valor?: number;
}

export interface OrcamentoServicoTerceirizadoDTO {
    id?: string;
    servicoTerceirizado?: ServicoTerceirizadoDTO | null;
    servico?: ServicoTerceirizadoDTO | null;
    valor?: number;
}

export interface OrcamentoDTO {
    id?: string;
    numero?: number;
    cliente?: ClienteDTO;
    veiculo?: VeiculoDTO;
    valor: number;
    valorDesconto: number;
    pacote: PacoteDTO;
    valorPacote: number;
    servicos: OrcamentoServicoDTO[];
    servicosTerceirizados?: OrcamentoServicoTerceirizadoDTO[];
    observacao?: string;
    nomeCliente?: string;
    telefoneContato?: string;
    dataCriacao?: string;
    status: OrcamentoStatus;
    tempoExecucaoMin: number;
}

export const normalizeOrcamentoForForm = (orcamento: Partial<OrcamentoDTO>): Partial<OrcamentoDTO> => {
    const getServicoTerceirizadoFromListaTerceirizada = (item: any): ServicoTerceirizadoDTO | null =>
        item?.servicoTerceirizado ?? item?.servico ?? null;

    const servicosInternos = (orcamento.servicos || [])
        .filter((item) => !!item?.servico)
        .map((item) => ({
            id: item.id,
            servico: item.servico,
            valor: item.valor,
            tipoServico: 'INTERNO' as const,
            tempoExecucaoMin: item.tempoExecucaoMin ?? item.servico?.tempoExecucaoMin,
        }));

    const servicosTerceirizadosSeparados = (orcamento.servicosTerceirizados || [])
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

    const servicosTerceirizadosNoArray = (orcamento.servicosTerceirizados || []).length > 0
        ? []
        : (orcamento.servicos || [])
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
        ...orcamento,
        servicos: [...servicosInternos, ...servicosTerceirizadosNoArray, ...servicosTerceirizadosSeparados],
    };
};

export const splitOrcamentoServicosForApi = (orcamento: Partial<OrcamentoDTO>): OrcamentoDTO => {
    const getServicoTerceirizadoFromListaTerceirizada = (item: any): ServicoTerceirizadoDTO | null =>
        item?.servicoTerceirizado ?? item?.servico ?? null;

    const servicos = (orcamento.servicos || [])
        .filter((item) => item?.tipoServico !== 'TERCEIRIZADO' && !item?.servicoTerceirizado && !!item?.servico?.id)
        .map((item) => ({
            id: item.id,
            servico: { id: item.servico!.id } as ServicoDTO,
            valor: item.valor,
        }));

    const servicosTerceirizadosFromMerged = (orcamento.servicos || [])
        .filter((item) => item?.tipoServico === 'TERCEIRIZADO' || !!item?.servicoTerceirizado)
        .map((item) => {
            const servicoTerceirizado = item.servicoTerceirizado ?? null;
            return {
                id: item.id,
                servico: servicoTerceirizado?.id
                    ? ({ id: servicoTerceirizado.id } as ServicoTerceirizadoDTO)
                    : null,
                valor: item.valor,
            };
        })
        .filter((item) => !!item.servico?.id);

    const servicosTerceirizados = servicosTerceirizadosFromMerged.length > 0
        ? servicosTerceirizadosFromMerged
        : (orcamento.servicosTerceirizados || [])
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
        ...(orcamento as OrcamentoDTO),
        servicos,
        servicosTerceirizados,
    };
};

// DTO para listagem
export interface OrcamentoListDTO {
    id: string;
    numero: number;
    clienteId?: string;
    clienteNome?: string;
    veiculoId?: string;
    veiculoDescricao?: string;
    pacoteId: string;
    pacoteNome: string;
    valor: number;
    valorDesconto: number;
    valorFinal: number;
    dataCriacao: string;
    status: OrcamentoStatus;
}

// Serviço CRUD genérico
const orcamentoCrud = createCrudService<OrcamentoDTO, OrcamentoListDTO>('/api/orcamentos', 'orcamento');

export const searchOrcamentos = orcamentoCrud.searchAdvanced;
export const getOrcamentoById = orcamentoCrud.getById;
export const updateOrcamento = orcamentoCrud.update;
export const deleteOrcamento = orcamentoCrud.delete;

// Criar orçamento e retornar os dados com o numero gerado
export const createOrcamento = async (
    orcamento: OrcamentoDTO
): Promise<{ data?: OrcamentoDTO; success?: boolean; error?: string; errors?: ApiError[] }> => {
    return apiPostWithResponse<OrcamentoDTO, OrcamentoDTO>(
        '/api/orcamentos',
        orcamento,
        'Erro ao criar orçamento'
    );
};

// Atualizar status do orçamento
export const updateOrcamentoStatus = async (
    id: string,
    status: OrcamentoStatus
): Promise<{ success?: boolean; error?: string }> => {
    return apiPatch(`/api/orcamentos/${id}/status`, { status }, 'Erro ao atualizar status');
};

// Cancelar orçamento
export const cancelarOrcamento = async (id: string): Promise<{ success?: boolean; error?: string }> => {
    return apiPost<void>(`/api/orcamentos/${id}/cancelar`, undefined, 'Erro ao cancelar orçamento');
};

// Gerar e baixar PDF do orçamento
export const downloadOrcamentoPdf = async (id: string, numero: number): Promise<{ success?: boolean; error?: string }> => {
    const result = await apiGetBlob(`/api/orcamentos/${id}/pdf`, 'Erro ao gerar PDF');

    if (result.error) {
        return { error: result.error };
    }

    // Baixar o arquivo
    const url = globalThis.URL.createObjectURL(result.data!);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento-${numero}.pdf`;
    document.body.appendChild(a);
    a.click();
    globalThis.URL.revokeObjectURL(url);
    a.remove();

    return { success: true };
};

// Buscar clientes para o autocomplete (reutiliza do agendamento)
export const searchClientesOrcamento = async (
    search: string = ''
): Promise<{ data?: ClienteListDTO[]; error?: string }> => {
    const params = new URLSearchParams({
        page: '0',
        size: '50',
    });
    if (search) {
        params.append('search', search);
    }

    const result = await apiGet<{ content: ClienteListDTO[] }>(
        `/api/clientes/list?${params}`,
        'Erro ao buscar clientes'
    );

    if (result.data) {
        return { data: result.data.content };
    }
    return { error: result.error };
};
