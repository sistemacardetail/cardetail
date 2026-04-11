import { PacoteDTO } from './PacoteService';
import { ServicoDTO } from '../servicos';
import React from 'react';

const INITIAL_VALUES: Partial<PacoteDTO> = {
    nome: '',
    descricao: '',
    observacao: '',
    valor: 0,
    tempoExecucaoMin: 0,
    ativo: true,
    tipoVeiculo: undefined,
    servicos: [],
};

export function usePacoteForm(initialValues?: Partial<PacoteDTO>) {
    const [values, setValues] = React.useState<Partial<PacoteDTO>>(
        initialValues || INITIAL_VALUES
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        if (initialValues) {
            setValues(initialValues);
        }
    }, [initialValues]);

    const handleChange = React.useCallback((field: keyof PacoteDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleAddServico = React.useCallback(() => {
        setValues((prev) => ({
            ...prev,
            servicos: [
                { servico: null as any },
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
        (index: number, servico: ServicoDTO | null) => {
            setValues((prev) => {
                const newServicos = [...(prev.servicos || [])];
                newServicos[index] = { ...newServicos[index], servico: servico as ServicoDTO };
                return { ...prev, servicos: newServicos };
            });
            setIsDirty(true);
        },
        []
    );

    const reset = React.useCallback(() => {
        setValues(initialValues || INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, [initialValues]);

    const validate = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.nome?.trim()) {
            newErrors.nome = 'O nome do pacote é obrigatório';
        }

        if (!values.servicos?.length || values.servicos.some(s => !s.servico)) {
            newErrors.servicos = 'Selecione pelo menos um serviço válido';
        }

        if (!values.tipoVeiculo) {
            newErrors.tipoVeiculo = 'Selecione um tipo de veículo';
        }

        if (values.tipoVeiculo && values.servicos?.length) {
            const hasIncompativel = values.servicos.some(s => {
                if (!s.servico) return false;
                return !s.servico.tiposVeiculos?.some(tv => tv.tipo?.id === values.tipoVeiculo?.id);
            });
            if (hasIncompativel) {
                newErrors.servicos = 'Remova os serviços incompatíveis com o tipo de veículo';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);

    return {
        values,
        errors,
        setErrors,
        isDirty,
        handleChange,
        handleAddServico,
        handleRemoveServico,
        handleServicoChange,
        reset,
        validate,
    };
}
