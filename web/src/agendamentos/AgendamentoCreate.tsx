import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { CrudForm } from '../components/crud';
import PageContainer from '../components/PageContainer';
import AgendamentoFormFields from './AgendamentoFormFields';
import { AgendamentoDTO, createAgendamento, splitAgendamentoServicosForApi } from './AgendamentoService';
import { useAgendamentoForm } from './useAgendamentoForm';
import { extractFieldErrors, formatApiErrors } from '../services/apiService';
import { OrcamentoDTO } from '../orcamentos';
import { PERMISSOES } from '../contexts/AuthContext';

export default function AgendamentoCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const notifications = useNotifications();

    const locationState = location.state as { from?: string; orcamento?: OrcamentoDTO } | undefined;
    const fromPath = locationState?.from || '/app/agendamentos';
    const orcamentoOrigem = locationState?.orcamento;

    const dataInicioParam = searchParams.get('dataInicio');
    const dataFimParam = searchParams.get('dataFim');

    const initialValues = React.useMemo(() => {
        if (orcamentoOrigem) {
            const servicosInternos = (orcamentoOrigem.servicos || [])
                .filter((item) => item?.tipoServico !== 'TERCEIRIZADO' && !!item?.servico)
                .map((item) => ({ servico: item.servico, valor: item.valor }));

            const servicosTerceirizados = (orcamentoOrigem.servicos || [])
                .filter((item) => item?.tipoServico === 'TERCEIRIZADO' || !!item?.servicoTerceirizado)
                .map((item) => ({
                    servicoTerceirizado: item.servicoTerceirizado ?? null,
                    valor: item.valor
                }))
                .filter((item) => !!item.servicoTerceirizado);

            return {
                veiculo: orcamentoOrigem.veiculo,
                valor: orcamentoOrigem.valor,
                valorDesconto: orcamentoOrigem.valorDesconto,
                valorPacote: orcamentoOrigem.valorPacote,
                pacote: orcamentoOrigem.pacote,
                servicos: servicosInternos,
                servicosTerceirizados: servicosTerceirizados.length > 0
                    ? servicosTerceirizados
                    : (orcamentoOrigem.servicosTerceirizados || []),
                observacao: orcamentoOrigem.observacao,
                orcamento: { id: orcamentoOrigem.id, numero: orcamentoOrigem.numero } as OrcamentoDTO,
            } as Partial<AgendamentoDTO>;
        }

        if (dataInicioParam) {
            return {
                dataPrevisaoInicio: dataInicioParam,
                dataPrevisaoFim: dataFimParam || dataInicioParam,
            };
        }
        return undefined;
    }, [dataInicioParam, dataFimParam, orcamentoOrigem]);

    const {
        values,
        errors,
        setErrors,
        isDirty,
        cliente,
        handleChange,
        handlePeriodoChange,
        handleClienteChange,
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
    } = useAgendamentoForm(initialValues);

    React.useEffect(() => {
        if (orcamentoOrigem) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            notifications.show({
                message: `Dados carregados do orçamento número ${orcamentoOrigem.numero}.`,
                severity: 'info',
            });
        }
    }, [orcamentoOrigem, notifications]);

    const handleSubmit = React.useCallback(async () => {
        if (!validate()) {
            notifications.show({
                message: 'Verifique os campos inválidos.',
                severity: 'error',
            });
            return;
        }

        const agendamentoData = splitAgendamentoServicosForApi(values);

        const result = await createAgendamento(agendamentoData);

        if (result.error) {
            const errorMessage = formatApiErrors(result.errors) || result.error;
            notifications.show({
                message: errorMessage,
                severity: 'error',
            });

            const fieldErrors = extractFieldErrors(result.errors);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            }
            return;
        }

        notifications.show({
            message: `Agendamento criado com sucesso!`,
            severity: 'success',
        });
        navigate(fromPath);
    }, [values, navigate, notifications, validate, setErrors, fromPath]);

    return (
        <PageContainer
            breadcrumbs={[
                { title: 'Agendamentos', path: '/app/agendamentos' },
                { title: 'Novo' },
            ]}
        >
            <CrudForm
                onSubmit={handleSubmit}
                onReset={reset}
                backButtonPath={fromPath}
                permission={PERMISSOES.AGENDAMENTOS_CRIAR}
                isDirty={isDirty}
            >
                <AgendamentoFormFields
                    values={values}
                    onChange={handleChange}
                    onPeriodoChange={handlePeriodoChange}
                    cliente={cliente}
                    onClienteChange={handleClienteChange}
                    onVeiculoChange={handleVeiculoChange}
                    onPacoteChange={handlePacoteChange}
                    onAddServico={handleAddServico}
                    onRemoveServico={handleRemoveServico}
                    onServicoChange={handleServicoChange}
                    onServicoValorChange={handleServicoValorChange}
                    valorTotal={valorTotal}
                    valorFinal={valorFinal}
                    tempoEstimadoTotal={tempoEstimadoTotal}
                    errors={errors}
                />
            </CrudForm>
        </PageContainer>
    );
}
