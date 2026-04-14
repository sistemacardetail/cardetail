import { ClienteAutocompleteDTO } from '../components/ClienteAutocomplete';
import { VeiculoAutoCompleteDTO } from '../components/VeiculoAutocomplete';
import { ClienteDTO, getClienteById } from '../clientes/ClienteService';

export const getTelefonePrincipal = (cliente?: ClienteDTO): string | undefined => {
    if (!cliente?.telefones) return undefined;
    const telefonePrincipal = cliente.telefones.find((t) => t.principal);
    if (telefonePrincipal?.telefone) {
        const { ddd, numero } = telefonePrincipal.telefone;
        return ddd && numero ? `(${ddd}) ${numero}` : numero;
    }
    return undefined;
};

export const clienteDTOToAutocomplete = (cliente?: ClienteDTO): ClienteAutocompleteDTO | null => {
    if (!cliente?.id) return null;
    return {
        id: cliente.id,
        nome: cliente.nome || '',
        telefonePrincipal: getTelefonePrincipal(cliente),
        observacao: cliente.observacao,
    };
};

export const veiculoToClienteAutocomplete = (
    veiculo?: VeiculoAutoCompleteDTO | null,
    clienteData?: ClienteAutocompleteDTO | null
): ClienteAutocompleteDTO | null => {
    if (clienteData?.id) {
        return {
            id: clienteData.id,
            nome: clienteData.nome || veiculo?.clienteNome || '',
            telefonePrincipal: clienteData.telefonePrincipal || veiculo?.clienteTelefone,
            observacao: clienteData.observacao || veiculo?.clienteObservacao,
        };
    }
    if (!veiculo?.clienteId) return null;
    return {
        id: veiculo.clienteId,
        nome: veiculo.clienteNome || '',
        telefonePrincipal: veiculo.clienteTelefone,
        observacao: veiculo.clienteObservacao,
    };
};

export const resetValoresPorVeiculo = <T extends { pacote?: unknown; servicos?: unknown[]; servicosTerceirizados?: unknown[]; valor?: number }>(
    prev: T
): T => ({
    ...prev,
    pacote: undefined,
    servicos: [],
    servicosTerceirizados: [],
    valor: 0,
});

export const fetchClienteAutocompleteById = (clienteId: string, debounceMs: number = 250): Promise<ClienteAutocompleteDTO | null> =>
    new Promise<ClienteAutocompleteDTO | null>((resolve, reject) => {
        const timeoutId = setTimeout(async () => {
            try {
                const { data } = await getClienteById(clienteId);
                resolve(clienteDTOToAutocomplete(data));
            } catch (error) {
                reject(error);
            }
        }, debounceMs);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const clear = () => clearTimeout(timeoutId);
    });
