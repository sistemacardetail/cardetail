import dayjs from 'dayjs';
import { AgendamentoListDTO, getResumoFinanceiro, searchAgendamentos, StatusPagamento } from '../agendamentos';

const DEFAULT_PAGE_SIZE = 200;
const MAX_PAGES = 10;

export interface ConsultaFilters {
    dataInicio?: string;
    dataFim?: string;
    clienteNome?: string;
    incluirCancelados?: boolean;
    statusPagamento?: StatusPagamento | 'TODOS';
}

export interface ConsultaFinanceiroItem {
    id: string;
    numero: number;
    clienteNome: string;
    veiculoMarca?: string;
    veiculoModelo?: string;
    veiculoPlaca?: string | null;
    veiculoSemPlaca?: boolean;
    dataPrevisaoInicio?: string;
    statusPagamento: StatusPagamento;
    valorTotal: number;
    valorRecebido: number;
    valorPendente: number;
}

export interface ConsultaFinanceiroResumo {
    valorRecebido: number;
    valorPendente: number;
    valorTotal: number;
    faturamentoAnual: number;
    itens: ConsultaFinanceiroItem[];
    serieMensal: Array<{ mes: string; recebido: number; pendente: number; total: number }>;
}

export interface ConsultaClienteItem {
    clienteNome: string;
    totalAgendamentos: number;
    ultimoAgendamento?: string;
    diasDesdeUltimaVisita: number | null;
    mediaDiasEntreVisitas: number | null;
    frequenciaMensal: number;
}

export interface ConsultaVeiculoItem {
    veiculoId: string;
    placa: string;
    modelo: string;
    marca: string;
    cor: string;
    clienteId: string;
    clienteNome: string;
    clienteTelefone?: string;
    totalAgendamentos: number;
    ultimoAgendamento?: string;
    diasDesdeUltimaVisita: number | null;
    mediaDiasEntreVisitas: number | null;
    frequenciaMensal: number;
}

export interface ConsultaVeiculoFilters {
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
    incluirCancelados?: boolean;
}

const buildSearchQuery = (filters: ConsultaFilters): string => {
    const clauses: string[] = [];

    if (filters.dataInicio) {
        clauses.push(`dataPrevisaoInicio=ge='${filters.dataInicio}T00:00:00'`);
    }

    if (filters.dataFim) {
        clauses.push(`dataPrevisaoInicio=le='${filters.dataFim}T23:59:59'`);
    }

    if (filters.clienteNome?.trim()) {
        const escaped = filters.clienteNome.trim().replace(/'/g, "''");
        clauses.push(`veiculo.cliente.nome=='*${escaped}*'`);
    }

    if (!filters.incluirCancelados) {
        clauses.push('status!=CANCELADO');
    }

    if (filters.statusPagamento && filters.statusPagamento !== 'TODOS') {
        clauses.push(`statusPagamento==${filters.statusPagamento}`);
    }

    return clauses.join(';');
};

const loadAgendamentos = async (filters: ConsultaFilters): Promise<AgendamentoListDTO[]> => {
    const search = buildSearchQuery(filters);
    let page = 0;
    let totalPages = 1;
    const items: AgendamentoListDTO[] = [];

    while (page < totalPages && page < MAX_PAGES) {
        const response = await searchAgendamentos({
            page,
            size: DEFAULT_PAGE_SIZE,
            search,
            sort: [{ field: 'numero', sort: 'desc' }],
        });

        if (!response.data) {
            break;
        }

        items.push(...response.data.content);
        totalPages = response.data.page.totalPages;
        page += 1;
    }

    return items;
};

const runWithConcurrency = async <T, R>(
    items: T[],
    worker: (item: T) => Promise<R>,
    concurrency = 8
): Promise<R[]> => {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
        const chunk = items.slice(i, i + concurrency);
        const chunkResults = await Promise.all(chunk.map(worker));
        results.push(...chunkResults);
    }

    return results;
};

export const consultarFaturamento = async (
    filters: ConsultaFilters
): Promise<{ data?: ConsultaFinanceiroResumo; error?: string }> => {
    const agendamentos = await loadAgendamentos(filters);

    if (agendamentos.length === 0) {
        return {
            data: {
                valorRecebido: 0,
                valorPendente: 0,
                valorTotal: 0,
                faturamentoAnual: 0,
                itens: [],
                serieMensal: [],
            },
        };
    }

    const itensFinanceiros = await runWithConcurrency(agendamentos, async (agendamento) => {
        const { data: resumo } = await getResumoFinanceiro(agendamento.id);
        const veiculo = agendamento.veiculo;

        return {
            id: agendamento.id,
            numero: agendamento.numero,
            clienteNome: agendamento.clienteNome || '-',
            veiculoMarca: veiculo?.modelo?.marca?.nome || '',
            veiculoModelo: veiculo?.modelo?.nome || '',
            veiculoPlaca: veiculo?.placa ?? '',
            veiculoSemPlaca: veiculo?.semPlaca ?? false,
            dataPrevisaoInicio: agendamento.dataPrevisaoInicio,
            statusPagamento: resumo?.statusPagamento || agendamento.statusPagamento || 'PENDENTE',
            valorTotal: resumo?.valorTotal ?? agendamento.valorFinal ?? 0,
            valorRecebido: resumo?.valorPagoTotal ?? 0,
            valorPendente: resumo?.saldoRestante ?? (agendamento.valorFinal ?? 0),
        } satisfies ConsultaFinanceiroItem;
    });

    const valorRecebido = itensFinanceiros.reduce((acc, item) => acc + item.valorRecebido, 0);
    const valorPendente = itensFinanceiros.reduce((acc, item) => acc + item.valorPendente, 0);
    const valorTotal = itensFinanceiros.reduce((acc, item) => acc + item.valorTotal, 0);

    const anoAtual = dayjs().year();
    const faturamentoAnual = itensFinanceiros
        .filter((item) => item.dataPrevisaoInicio && dayjs(item.dataPrevisaoInicio).year() === anoAtual)
        .reduce((acc, item) => acc + item.valorRecebido, 0);

    const monthlyMap = new Map<string, { recebido: number; pendente: number; total: number }>();

    itensFinanceiros.forEach((item) => {
        if (!item.dataPrevisaoInicio) return;
        const monthKey = dayjs(item.dataPrevisaoInicio).format('YYYY-MM');
        const current = monthlyMap.get(monthKey) || { recebido: 0, pendente: 0, total: 0 };

        current.recebido += item.valorRecebido;
        current.pendente += item.valorPendente;
        current.total += item.valorTotal;

        monthlyMap.set(monthKey, current);
    });

    const serieMensal = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, values]) => ({ mes, ...values }));

    return {
        data: {
            valorRecebido,
            valorPendente,
            valorTotal,
            faturamentoAnual,
            itens: itensFinanceiros,
            serieMensal,
        },
    };
};

const calculateAverageDays = (datas: string[]): number | null => {
    if (datas.length < 2) return null;

    const sorted = [...datas].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
    let totalDias = 0;

    for (let i = 1; i < sorted.length; i += 1) {
        totalDias += dayjs(sorted[i]).diff(dayjs(sorted[i - 1]), 'day');
    }

    return Number((totalDias / (sorted.length - 1)).toFixed(1));
};

const calculateMonthlyFrequency = (datas: string[]): number => {
    if (datas.length === 0) return 0;

    const sorted = [...datas].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
    const primeiro = dayjs(sorted[0]);
    const ultimo = dayjs(sorted[sorted.length - 1]);
    const meses = Math.max(1, ultimo.diff(primeiro, 'month') + 1);

    return Number((datas.length / meses).toFixed(2));
};

export const consultarClientes = async (
    filters: ConsultaFilters
): Promise<{ data?: ConsultaClienteItem[]; error?: string }> => {
    const agendamentos = await loadAgendamentos(filters);

    const porCliente = new Map<string, AgendamentoListDTO[]>();

    agendamentos.forEach((agendamento) => {
        const nome = agendamento.clienteNome || 'Cliente não identificado';
        const current = porCliente.get(nome) || [];
        current.push(agendamento);
        porCliente.set(nome, current);
    });

    const resultado: ConsultaClienteItem[] = Array.from(porCliente.entries()).map(([clienteNome, itens]) => {
        const datas = itens
            .map((item) => item.dataPrevisaoInicio)
            .filter((data): data is string => Boolean(data));

        const ultimoAgendamento = datas.length > 0
            ? datas.reduce((latest, current) => (dayjs(current).isAfter(dayjs(latest)) ? current : latest))
            : undefined;

        const diasDesdeUltimaVisita = ultimoAgendamento
            ? dayjs().startOf('day').diff(dayjs(ultimoAgendamento).startOf('day'), 'day')
            : null;

        const mediaDiasEntreVisitas = calculateAverageDays(datas);
        const frequenciaMensal = calculateMonthlyFrequency(datas);

        return {
            clienteNome,
            totalAgendamentos: itens.length,
            ultimoAgendamento,
            diasDesdeUltimaVisita,
            mediaDiasEntreVisitas,
            frequenciaMensal,
        };
    });

    resultado.sort((a, b) => b.totalAgendamentos - a.totalAgendamentos);

    return { data: resultado };
};

const buildVeiculoSearchQuery = (filters: ConsultaVeiculoFilters): string => {
    const clauses: string[] = [];

    if (filters.dataInicio) {
        clauses.push(`dataPrevisaoInicio=ge='${filters.dataInicio}T00:00:00'`);
    }

    if (filters.dataFim) {
        clauses.push(`dataPrevisaoInicio=le='${filters.dataFim}T23:59:59'`);
    }

    if (filters.busca?.trim()) {
        const escaped = filters.busca.trim().replace(/'/g, "''");
        const searchTerm = `*${escaped}*`;
        clauses.push(`(veiculo.cliente.nome==${searchTerm},veiculo.placa==${searchTerm},veiculo.modelo.nome==${searchTerm})`);
    }

    if (!filters.incluirCancelados) {
        clauses.push('status!=CANCELADO');
    }

    return clauses.join(';');
};

export const consultarVeiculos = async (
    filters: ConsultaVeiculoFilters
): Promise<{ data?: ConsultaVeiculoItem[]; error?: string }> => {
    const search = buildVeiculoSearchQuery(filters);
    let page = 0;
    let totalPages = 1;
    const agendamentos: AgendamentoListDTO[] = [];

    while (page < totalPages && page < MAX_PAGES) {
        const response = await searchAgendamentos({
            page,
            size: DEFAULT_PAGE_SIZE,
            search,
            sort: [{ field: 'numero', sort: 'desc' }],
        });

        if (!response.data) {
            break;
        }

        agendamentos.push(...response.data.content);
        totalPages = response.data.page.totalPages;
        page += 1;
    }

    const porVeiculo = new Map<string, AgendamentoListDTO[]>();

    agendamentos.forEach((agendamento) => {
        const veiculoId = agendamento.veiculo?.id || 'sem-veiculo';
        const current = porVeiculo.get(veiculoId) || [];
        current.push(agendamento);
        porVeiculo.set(veiculoId, current);
    });

    const resultado: ConsultaVeiculoItem[] = Array.from(porVeiculo.entries()).map(([veiculoId, itens]) => {
        const primeiroItem = itens[0];
        const veiculo = primeiroItem.veiculo;

        const datas = itens
            .map((item) => item.dataPrevisaoInicio)
            .filter((data): data is string => Boolean(data));

        const ultimoAgendamento = datas.length > 0
            ? datas.reduce((latest, current) => (dayjs(current).isAfter(dayjs(latest)) ? current : latest))
            : undefined;

        const diasDesdeUltimaVisita = ultimoAgendamento
            ? dayjs().startOf('day').diff(dayjs(ultimoAgendamento).startOf('day'), 'day')
            : null;

        const mediaDiasEntreVisitas = calculateAverageDays(datas);
        const frequenciaMensal = calculateMonthlyFrequency(datas);

        return {
            veiculoId,
            placa: veiculo?.placa || 'Sem placa',
            modelo: veiculo?.modelo?.nome || '-',
            marca: veiculo?.modelo?.marca?.nome || '-',
            cor: veiculo?.cor?.nome || '-',
            clienteId: '',
            clienteNome: primeiroItem.clienteNome || 'Cliente não identificado',
            clienteTelefone: undefined,
            totalAgendamentos: itens.length,
            ultimoAgendamento,
            diasDesdeUltimaVisita,
            mediaDiasEntreVisitas,
            frequenciaMensal,
        };
    });

    resultado.sort((a, b) => (b.diasDesdeUltimaVisita ?? 0) - (a.diasDesdeUltimaVisita ?? 0));

    return { data: resultado };
};
