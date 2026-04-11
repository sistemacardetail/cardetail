import React from 'react';
import { ClienteDTO, TelefoneClienteDTO, TelefoneDTO, VeiculoDTO } from './ClienteService';

const INITIAL_VALUES: Partial<ClienteDTO> = {
    nome: '',
    observacao: '',
    ativo: true,
    telefones: [],
    veiculos: [],
};

export function useClienteForm(initialValues?: Partial<ClienteDTO>) {
    const [values, setValues] = React.useState<Partial<ClienteDTO>>(
        initialValues || INITIAL_VALUES
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = React.useState(false);

    // Atualiza valores quando initialValues mudar (para edição)
    React.useEffect(() => {
        if (initialValues) {
            setValues(initialValues);
        }
    }, [initialValues]);

    const handleChange = React.useCallback((field: keyof ClienteDTO, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
    }, []);

    const handleTelefoneChange = React.useCallback(
        (
            index: number,
            field: keyof TelefoneClienteDTO,
            value: string | boolean,
            telefoneField?: keyof TelefoneDTO
        ) => {
            setValues((prev) => {
                const newTelefones = [...(prev.telefones || [])];

                const current = { ...newTelefones[index] };

                if (field === "telefone" && telefoneField) {
                    current.telefone = {
                        ...current.telefone,
                        [telefoneField]: value as string,
                    };
                } else {
                    (current as any)[field] = value;
                }

                if (field === "principal" && value === true) {
                    newTelefones.forEach((tel, i) => {
                        if (i !== index) {
                            tel.principal = false;
                        }
                    });
                }

                newTelefones[index] = current;

                return { ...prev, telefones: newTelefones };
            });
            setIsDirty(true);
        },
        []
    );

    const handleAddTelefone = React.useCallback(() => {
        setValues((prev) => ({
            ...prev,
            telefones: [
                ...(prev.telefones || []),
                { telefone: { ddd: '', numero: '' }, principal: (prev.telefones || []).length === 0 },
            ],
        }));
        setIsDirty(true);
    }, []);

    const handleRemoveTelefone = React.useCallback((index: number) => {
        setValues((prev) => {
            const newTelefones = (prev.telefones || []).filter((_, i) => i !== index);
            // Se remover o principal, marca o primeiro como principal
            if (newTelefones.length > 0 && !newTelefones.some((t) => t.principal)) {
                newTelefones[0].principal = true;
            }
            return { ...prev, telefones: newTelefones };
        });
        setIsDirty(true);
    }, []);

    const handleVeiculoChange = React.useCallback(
        (index: number, field: keyof VeiculoDTO, value: any) => {
            setValues((prev) => {
                const newVeiculos = [...(prev.veiculos || [])];
                newVeiculos[index] = {
                    ...newVeiculos[index],
                    [field]: value,
                };
                if (field === 'semPlaca' && value === true) {
                    newVeiculos[index].placa = null;
                }
                return { ...prev, veiculos: newVeiculos };
            });
            setIsDirty(true);
        },
        []
    );

    const handleAddVeiculo = React.useCallback(() => {
        setValues((prev) => ({
            ...prev,
            veiculos: [
                ...(prev.veiculos || []),
                { placa: null, modelo: null, cor: null, observacao: '', semPlaca: false } as any,
            ],
        }));
        setIsDirty(true);
    }, []);

    const handleRemoveVeiculo = React.useCallback((index: number) => {
        setValues((prev) => ({
            ...prev,
            veiculos: (prev.veiculos || []).filter((_, i) => i !== index),
        }));
        setIsDirty(true);
    }, []);

    const reset = React.useCallback(() => {
        setValues(initialValues || INITIAL_VALUES);
        setErrors({});
        setIsDirty(false);
    }, [initialValues]);

    const validate = React.useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!values.nome?.trim()) {
            newErrors.nome = 'O nome do cliente é obrigatório';
        }

        if (!values.veiculos?.length) {
            newErrors.veiculos = 'É necessário pelo menos um veículo';
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
        handleTelefoneChange,
        handleAddTelefone,
        handleRemoveTelefone,
        handleVeiculoChange,
        handleAddVeiculo,
        handleRemoveVeiculo,
        reset,
        validate,
    };
}
