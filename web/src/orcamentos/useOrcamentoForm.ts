import React from 'react';
import { normalizeOrcamentoForForm, OrcamentoDTO } from './OrcamentoService';
import { ServicoSelecionavelDTO } from '../servicos';
import { VeiculoDTO } from '../clientes/ClienteService';
import { PacoteDTO } from '../pacotes';

const INITIAL_VALUES: Partial<OrcamentoDTO> = {
    veiculo: undefined,
    valor: 0,
    valorDesconto: 0,
    valorPacote: 0,
    pacote: undefined,
    servicos: [],
    servicosTerceirizados: [],
    observacao: '',
    nomeCliente: '',
    telefoneContato: '',
};

export function useOrcamentoForm(initialValues?: Partial<OrcamentoDTO>) {
    const [values, setValues] = React.useState<Partial<OrcamentoDTO>>(
        initialValues ? normalizeOrcamentoForForm(initialValues) : INITIAL_VALUES
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        if (initialValues) {
            setValues(normalizeOrcamentoForForm(initialValues));
            setIsDirty(false);
        }
    }, [initialValues]);

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


    const handleChange = React.useCallback((field: keyof OrcamentoDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleVeiculoChange = React.useCallback((veiculo: VeiculoDTO | null) => {
        setValues((prev) => ({
            ...prev,
            veiculo: veiculo as VeiculoDTO | undefined,
            pacote: undefined,
            servicos: [],
            servicosTerceirizados: [],
            valor: 0,
        }));
        setErrors((prev) => ({ ...prev, veiculo: '' }));
        setIsDirty(true);
    }, []);

    const handlePacoteChange = React.useCallback((pacote: PacoteDTO | null) => {
        setValues((prev) => ({
            ...prev,
            pacote: pacote as PacoteDTO,
            valorPacote: pacote?.valor ?? 0,
        }));
        setErrors((prev) => ({ ...prev, pacote: '', valorPacote: '' }));
        setIsDirty(true);
    }, []);

    const handleAddServico = React.useCallback(() => {
        setValues((prev) => ({
            ...prev,
            servicos: [
                { servico: null as any, tipoServico: 'INTERNO' },
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
        setValues(initialValues ? normalizeOrcamentoForForm(initialValues) : INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, [initialValues]);

    const clearDirty = React.useCallback(() => {
        setIsDirty(false);
    }, []);

    const validate = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        const hasServicoNoArrayPrincipal = (values.servicos || []).some((s) => !!s.servico || !!s.servicoTerceirizado);
        const hasServicoTerceirizadoSeparado = (values.servicosTerceirizados || []).some((s) => !!s.servicoTerceirizado);

        if (!values.pacote && !hasServicoNoArrayPrincipal && !hasServicoTerceirizadoSeparado) {
            newErrors.pacote = 'Selecione um pacote ou adicione pelo menos um serviço.';
        }

        if (!values.veiculo) {
            newErrors.veiculo = 'Selecione um veículo';
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, valorTotal, valorFinal, hasTerceirizadoInServicos]);

    return {
        values,
        errors,
        setErrors,
        isDirty,
        clearDirty,
        handleChange,
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
    };
}
