import { ServicoDTO } from './ServicoService';
import { ServicoTerceirizadoDTO, ServicoTerceirizadoListDTO } from '../servicos-terceirizados';

export type TipoServicoSelecionavel = 'INTERNO' | 'TERCEIRIZADO';

export interface ServicoSelecionavelDTO {
    id?: string;
    nome: string;
    valor?: number;
    tempoExecucaoMin?: number;
    tipoServico: TipoServicoSelecionavel;
    servico?: ServicoDTO;
    servicoTerceirizado?: ServicoTerceirizadoDTO;
}

export const mapServicoInternoToSelecionavel = (servico: ServicoDTO): ServicoSelecionavelDTO => ({
    id: servico.id,
    nome: servico.nome,
    valor: servico.valor,
    tempoExecucaoMin: servico.tempoExecucaoMin,
    tipoServico: 'INTERNO',
    servico,
});

export const mapServicoTerceirizadoToSelecionavel = (
    servico: ServicoTerceirizadoDTO | ServicoTerceirizadoListDTO
): ServicoSelecionavelDTO => ({
    id: servico.id,
    nome: servico.nome,
    valor: 'valor' in servico ? servico.valor : undefined,
    tempoExecucaoMin: 'tempoExecucaoMin' in servico ? servico.tempoExecucaoMin : undefined,
    tipoServico: 'TERCEIRIZADO',
    servicoTerceirizado: servico as ServicoTerceirizadoDTO,
});

export const getServicoSelecionavelKey = (servico: ServicoSelecionavelDTO | null | undefined): string => {
    if (!servico?.id) return '';
    return `${servico.tipoServico}:${servico.id}`;
};
