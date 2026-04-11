import React from 'react';
import { AgendamentoDTO, normalizeAgendamentoForForm } from './AgendamentoService';
import { ServicoSelecionavelDTO } from '../servicos';
import { VeiculoDTO } from '../clientes/ClienteService';
import { PacoteDTO } from '../pacotes';

const INITIAL_VALUES: Partial<AgendamentoDTO> = {
    veiculo: undefined,
    valor: 0,
    valorDesconto: 0,
    valorPacote: 0,
    dataPrevisaoInicio: undefined,
    dataPrevisaoFim: undefined,
    pacote: undefined,
    servicos: [],
    servicosTerceirizados: [],
    observacao: '',
};

export function useAgendamentoForm(initialValues?: Partial<AgendamentoDTO>) {
    const isManualPeriod = React.useCallback((vals?: Partial<AgendamentoDTO>) => {
        return !!(vals?.dataPrevisaoInicio && vals?.dataPrevisaoFim);
    }, []);

    const [values, setValues] = React.useState<Partial<AgendamentoDTO>>(
        initialValues ? normalizeAgendamentoForForm({ ...INITIAL_VALUES, ...initialValues }) : INITIAL_VALUES
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);
    const periodoEditadoManualmente = React.useRef(false);

    React.useEffect(() => {
        if (initialValues) {
            setValues(normalizeAgendamentoForForm({ ...INITIAL_VALUES, ...initialValues }));
            setIsDirty(false);
            periodoEditadoManualmente.current = isManualPeriod(initialValues);
        }
    }, [initialValues, isManualPeriod]);

    const hasTerceirizadoInServicos = React.useMemo(
        () => (values.servicos || []).some((s) => s.tipoServico === 'TERCEIRIZADO' || !!s.servicoTerceirizado),
        [values.servicos]
    );

    const valorTotal = React.useMemo(() => {
        const valorPacote = values.valorPacote ?? 0;
        const valorServicos = (values.servicos || []).reduce(
            (acc, s) => acc + (s.valor ?? 0),
            0
        );
        const valorServicosTerceirizados = hasTerceirizadoInServicos
            ? 0
            : (values.servicosTerceirizados || []).reduce(
            (acc, s) => acc + (s.valor ?? 0),
            0
        );
        return valorPacote + valorServicos + valorServicosTerceirizados;
    }, [values.valorPacote, values.servicos, values.servicosTerceirizados, hasTerceirizadoInServicos]);

    const valorFinal = React.useMemo(() => {
        const desconto = values.valorDesconto ?? 0;
        return valorTotal - desconto;
    }, [valorTotal, values.valorDesconto]);

    // Atualiza o valor quando o valor total muda
    React.useEffect(() => {
        setValues((prev) => ({ ...prev, valor: valorTotal }));
    }, [valorTotal]);

    const tempoEstimadoTotal = React.useMemo(() => {
        const tempoPacote = values.pacote?.tempoExecucaoMin ?? 0;
        const tempoServicos = (values.servicos || []).reduce(
            (acc, s) => acc + (s.tempoExecucaoMin ?? s.servico?.tempoExecucaoMin ?? s.servicoTerceirizado?.tempoExecucaoMin ?? 0),
            0
        );
        return tempoPacote + tempoServicos;
    }, [values.pacote, values.servicos]);

    const calcularDataFim = React.useCallback(
        (dataInicio: string, tempoMinutos: number): string => {
            if (!dataInicio || tempoMinutos <= 0) return '';

            const data = new Date(dataInicio);
            data.setMinutes(data.getMinutes() + tempoMinutos);

            const pad = (n: number) => n.toString().padStart(2, '0');

            return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(
                data.getDate()
            )}T${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`;
        },
        []
    );

    const applyEstimatedEnd = React.useCallback((start?: string, tempo?: number) => {
        const dataInicio = start ?? values.dataPrevisaoInicio;
        const tempoMin = tempo ?? tempoEstimadoTotal;
        if (!dataInicio || tempoMin <= 0) return;
        const novaDataFim = calcularDataFim(dataInicio, tempoMin);
        if (!novaDataFim) return;
        setValues((prev) => ({ ...prev, dataPrevisaoFim: novaDataFim }));
    }, [values.dataPrevisaoInicio, tempoEstimadoTotal, calcularDataFim]);

    React.useEffect(() => {
        if (periodoEditadoManualmente.current) return;
        applyEstimatedEnd();
    }, [values.dataPrevisaoInicio, tempoEstimadoTotal, applyEstimatedEnd]);


    const handleChange = React.useCallback((field: keyof AgendamentoDTO, value: any) => {
        if (field === 'dataPrevisaoInicio' || field === 'dataPrevisaoFim') {
            periodoEditadoManualmente.current = true;
        }

        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handlePeriodoChange = React.useCallback((inicio: string | null, fim: string | null) => {
        periodoEditadoManualmente.current = true;
        setValues((prev) => ({
            ...prev,
            dataPrevisaoInicio: inicio ?? undefined,
            dataPrevisaoFim: fim ?? undefined,
        }));
        setErrors((prev) => ({ ...prev, dataPrevisaoInicio: '', dataPrevisaoFim: '' }));
        setIsDirty(true);
    }, []);

    const handleVeiculoChange = React.useCallback((veiculo: VeiculoDTO | null) => {
        setValues((prev) => ({
            ...prev,
            veiculo: veiculo as VeiculoDTO,
            // Limpa pacote e serviços adicionais ao trocar veículo
            pacote: undefined,
            servicos: [],
            servicosTerceirizados: [],
            valor: 0,
        }));
        setErrors((prev) => ({ ...prev, veiculo: '' }));
        setIsDirty(true);
    }, []);

    const handlePacoteChange = React.useCallback((pacote: PacoteDTO | null) => {
        setValues((prev) => {
            const newValues: Partial<AgendamentoDTO> = {
                ...prev,
                pacote: pacote as PacoteDTO,
                valorPacote: pacote?.valor ?? 0,
            };
            return newValues;
        });
        setErrors((prev) => ({ ...prev, pacote: '', valorPacote: '' }));
        setIsDirty(true);
    }, []);

    const handleAddServico = React.useCallback(() => {
        setValues((prev) => ({
            ...prev,
            servicos: [
                { servico: null, tipoServico: 'INTERNO' },
                ...(prev.servicos || []),
            ],
        }));
        setIsDirty(true);
    }, []);

    const handleRemoveServico = React.useCallback((index: number) => {
        setValues((prev) => ({
            ...prev,
            servicos: (prev.servicos || []).filter((_, i) => i !== index),
        }));
        setIsDirty(true);
    }, []);

    const handleServicoChange = React.useCallback(
        (index: number, servico: ServicoSelecionavelDTO | null) => {
            setValues((prev) => {
                const newServicos = [...(prev.servicos || [])];
                newServicos[index] = {
                    ...newServicos[index],
                    tipoServico: servico?.tipoServico ?? 'INTERNO',
                    servico: servico?.tipoServico === 'INTERNO' ? servico.servico ?? null : null,
                    servicoTerceirizado: servico?.tipoServico === 'TERCEIRIZADO' ? servico.servicoTerceirizado ?? null : undefined,
                    tempoExecucaoMin: servico?.tempoExecucaoMin ?? 0,
                    valor: servico?.valor ?? 0,
                };
                return { ...prev, servicos: newServicos };
            });
            setIsDirty(true);
        },
        []
    );

    const handleServicoValorChange = React.useCallback(
        (index: number, valor: number) => {
            setValues((prev) => {
                const newServicos = [...(prev.servicos || [])];
                newServicos[index] = { ...newServicos[index], valor };
                return { ...prev, servicos: newServicos };
            });
            setErrors((prev) => ({ ...prev, [`servico_${index}`]: '' }));
            setIsDirty(true);
        },
        []
    );

    const reset = React.useCallback(() => {
        setValues(initialValues ? normalizeAgendamentoForForm(initialValues) : INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
        periodoEditadoManualmente.current = isManualPeriod(initialValues);
    }, [initialValues, isManualPeriod]);

    const updatePagamentoInfo = React.useCallback((statusPagamento?: string, valorPagoTotal?: number) => {
        setValues((prev) => ({
            ...prev,
            statusPagamento: statusPagamento as AgendamentoDTO['statusPagamento'],
            valorPagoTotal: valorPagoTotal ?? 0,
        }));
    }, []);

    const validate = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.veiculo) {
            newErrors.veiculo = 'Selecione um veículo';
        }

        const hasServicoNoArrayPrincipal = (values.servicos || []).some((s) => !!s.servico || !!s.servicoTerceirizado);
        const hasServicoTerceirizadoSeparado = (values.servicosTerceirizados || []).some((s) => !!s.servicoTerceirizado);

        if (!values.pacote && !hasServicoNoArrayPrincipal && !hasServicoTerceirizadoSeparado) {
            newErrors.pacote = 'Selecione um pacote ou adicione pelo menos um serviço.';
        }

        if (!values.dataPrevisaoInicio) {
            newErrors.dataPrevisaoInicio = 'Informe a data de previsão de início';
        }

        if (!values.dataPrevisaoFim) {
            newErrors.dataPrevisaoFim = 'Informe a data de previsão de fim';
        }

        if (values.dataPrevisaoInicio && values.dataPrevisaoFim && values.dataPrevisaoInicio > values.dataPrevisaoFim) {
            newErrors.dataPrevisaoFim = 'A data de início deve ser menor que a data fim';
        }

        if (values.pacote && (values.valorPacote ?? 0) <= 0) {
            newErrors.valorPacote = 'O valor do pacote deve ser maior que zero';
        }

        (values.servicos || []).forEach((s, index) => {
            if ((s.servico || s.servicoTerceirizado) && (s.valor ?? 0) <= 0) {
                newErrors[`servico_${index}`] = 'O valor deve ser maior que zero';
            }
        });

        (values.servicosTerceirizados || []).forEach((s, index) => {
            if (s.servicoTerceirizado && (s.valor ?? 0) <= 0 && !hasTerceirizadoInServicos) {
                newErrors[`servico_terceirizado_${index}`] = 'O valor deve ser maior que zero';
            }
        });

        if (values.valorDesconto && values.valorDesconto > valorTotal) {
            newErrors.valorDesconto = 'O valor desconto não pode ser maior que o valor total';
        }

        if (valorFinal <= 0) {
            newErrors.valorFinal = 'O valor final deve ser maior do que zero';
        }

        const valorPagoTotal = values.valorPagoTotal ?? 0;
        if (valorPagoTotal > 0 && valorFinal < valorPagoTotal) {
            newErrors.valorDesconto = `O valor final (R$ ${valorFinal.toFixed(2).replace('.', ',')}) não pode ser menor que o valor já pago (R$ ${valorPagoTotal.toFixed(2).replace('.', ',')})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, valorTotal, valorFinal, hasTerceirizadoInServicos]);

    return {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handlePeriodoChange,
        handleVeiculoChange,
        handlePacoteChange,
        handleAddServico,
        handleRemoveServico,
        handleServicoChange,
        handleServicoValorChange,
        reset,
        validate,
        valorTotal,
        valorFinal,
        tempoEstimadoTotal,
        updatePagamentoInfo,
    };
}
