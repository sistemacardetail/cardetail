import { apiGet, apiPostWithResponse } from '../services/apiService';

export type StatusPagamento = 'PENDENTE' | 'PARCIAL' | 'PAGO';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'TRANSFERENCIA' | 'PERMUTA';

export interface AgendamentoPagamentoDTO {
    id?: string;
    valorPago: number;
    dataRecebimento: string;
    formaPagamento: FormaPagamento;
    formaPagamentoDescricao?: string;
    observacao?: string;
    dataCriacao?: string;
}

export interface AgendamentoPagamentoRequestDTO {
    valorPago: number;
    dataRecebimento: string;
    formaPagamento: FormaPagamento;
    observacao?: string;
}

export interface AgendamentoResumoFinanceiroDTO {
    agendamentoId: string;
    numero: number;
    valorTotal: number;
    valorPagoTotal: number;
    saldoRestante: number;
    percentualPago: number;
    statusPagamento: StatusPagamento;
    statusPagamentoDescricao: string;
    podeReceberPagamento: boolean;
    isEditavel: boolean;
    pagamentos: AgendamentoPagamentoDTO[];
}

export const getResumoFinanceiro = async (
    agendamentoId: string
): Promise<{ data?: AgendamentoResumoFinanceiroDTO; error?: string }> => {
    return await apiGet<AgendamentoResumoFinanceiroDTO>(
        `/api/agendamentos/${agendamentoId}/pagamentos/resumo`,
        'Erro ao buscar resumo financeiro'
    );
};

export const listarPagamentos = async (
    agendamentoId: string
): Promise<{ data?: AgendamentoPagamentoDTO[]; error?: string }> => {
    return await apiGet<AgendamentoPagamentoDTO[]>(
        `/api/agendamentos/${agendamentoId}/pagamentos`,
        'Erro ao buscar pagamentos'
    );
};

export const adicionarPagamento = async (
    agendamentoId: string,
    pagamento: AgendamentoPagamentoRequestDTO
): Promise<{ data?: AgendamentoPagamentoDTO; error?: string }> => {
    return apiPostWithResponse<AgendamentoPagamentoRequestDTO, AgendamentoPagamentoDTO>(
        `/api/agendamentos/${agendamentoId}/pagamentos`,
        pagamento,
        'Erro ao adicionar pagamento'
    );
};

export const removerPagamento = async (
    agendamentoId: string,
    pagamentoId: string
): Promise<{ success?: boolean; error?: string }> => {
    const response = await fetch(`/api/agendamentos/${agendamentoId}/pagamentos/${pagamentoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return { error: 'Erro ao remover pagamento' };
    }

    return { success: true };
};

export const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'TRANSFERENCIA', label: 'Transferência' },
    { value: 'PERMUTA', label: 'Permuta' },
];
