package br.com.cardetail.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.domain.Agendamento;
import br.com.cardetail.domain.AgendamentoServico;
import br.com.cardetail.domain.Cliente;
import br.com.cardetail.domain.Pacote;
import br.com.cardetail.domain.Servico;
import br.com.cardetail.dto.AgendamentoCalendarioDTO;
import br.com.cardetail.repository.AgendamentoRepository;
import br.com.cardetail.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AgendamentoCalendarioService {

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository repository;

    public List<AgendamentoCalendarioDTO> findByPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim) {
        List<Agendamento> agendamentos = repository.findByPeriodo(dataInicio, dataFim);
        return agendamentos.stream()
                .map(this::toCalendarioDTO)
                .toList();
    }

    public List<AgendamentoCalendarioDTO> findByDia(LocalDateTime data) {
        List<Agendamento> agendamentos = repository.findByDia(data);
        return agendamentos.stream()
                .map(this::toCalendarioDTO)
                .toList();
    }

    private AgendamentoCalendarioDTO toCalendarioDTO(Agendamento agendamento) {
        Cliente cliente = clienteRepository.findByVeiculoId(agendamento.getVeiculo().getId())
                .orElse(null);

        String clienteNome = cliente != null ? cliente.getNome() : "Cliente não encontrado";
        UUID clienteId = cliente != null ? cliente.getId() : null;

        return AgendamentoCalendarioDTO.builder()
                .id(agendamento.getId())
                .numero(agendamento.getNumero())
                .clienteId(clienteId)
                .clienteNome(clienteNome)
                .veiculoId(agendamento.getVeiculo().getId())
                .veiculoModelo(agendamento.getVeiculo().getModelo().getMarca().getNome() + " " +
                              agendamento.getVeiculo().getModelo().getNome())
                .veiculoPlaca(agendamento.getVeiculo().getPlacaFormatted())
                .veiculoCor(agendamento.getVeiculo().getCor().getNome())
                .pacoteId(Optional.ofNullable(agendamento.getPacote()).map(Pacote::getId).orElse(null))
                .pacoteNome(Optional.ofNullable(agendamento.getPacote()).map(Pacote::getNome).orElse(null))
                .titulo(Optional.ofNullable(agendamento.getPacote()).map(Pacote::getNome).orElse("Serviços"))
                .dataHoraInicio(agendamento.getDataPrevisaoInicio())
                .dataHoraFim(agendamento.getDataPrevisaoFim())
                .status(agendamento.getStatus().name())
                .valorFinal(agendamento.getValorFinal())
                .observacao(agendamento.getObservacao())
                .servicosNome(agendamento.getServicos()
                        .stream()
                        .map(AgendamentoServico::getServico)
                        .map(Servico::getNome)
                        .toList()
                )
                .build();
    }

}
