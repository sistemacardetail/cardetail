package br.com.cardetail.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.cardetail.config.security.SecurityContext;
import br.com.cardetail.domain.Agendamento;
import br.com.cardetail.domain.AgendamentoPagamento;
import br.com.cardetail.dto.AgendamentoPagamentoDTO;
import br.com.cardetail.dto.AgendamentoPagamentoRequestDTO;
import br.com.cardetail.dto.AgendamentoResumoFinanceiroDTO;
import br.com.cardetail.enums.StatusPagamento;
import br.com.cardetail.mapper.AgendamentoPagamentoMapper;
import br.com.cardetail.repository.AgendamentoPagamentoRepository;
import br.com.cardetail.repository.AgendamentoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class AgendamentoPagamentoService {

    private final AgendamentoPagamentoRepository pagamentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AgendamentoPagamentoMapper mapper;
    private final SecurityContext securityContext;

    @Transactional(readOnly = true)
    public AgendamentoResumoFinanceiroDTO getResumoFinanceiro(UUID agendamentoId) {
        Agendamento agendamento = findAgendamentoOrThrow(agendamentoId);

        BigDecimal valorPagoTotal = pagamentoRepository.sumValorPagoByAgendamentoId(agendamentoId);
        BigDecimal valorFinal = agendamento.getValorFinal();
        BigDecimal saldoRestante = valorFinal.subtract(valorPagoTotal);

        BigDecimal percentualPago = BigDecimal.ZERO;
        if (valorFinal.compareTo(BigDecimal.ZERO) > 0) {
            percentualPago = valorPagoTotal
                .multiply(new BigDecimal("100"))
                .divide(valorFinal, 2, java.math.RoundingMode.HALF_UP);
        }

        boolean isPago = saldoRestante.compareTo(BigDecimal.ZERO) <= 0 && valorPagoTotal.compareTo(BigDecimal.ZERO) > 0;
        boolean podeReceberPagamento = !agendamento.isCancelado() && !isPago;
        boolean isEditavel = !agendamento.isCancelado() && !agendamento.isPago();

        List<AgendamentoPagamento> pagamentos = pagamentoRepository.findByIdAgendamentoOrderByDataRecebimentoDesc(agendamentoId);

        return new AgendamentoResumoFinanceiroDTO(
            agendamento.getId().toString(),
            agendamento.getNumero(),
            valorFinal,
            valorPagoTotal,
            saldoRestante,
            percentualPago,
            agendamento.getStatusPagamento(),
            agendamento.getStatusPagamento() != null ? agendamento.getStatusPagamento().getDescricao() : null,
            podeReceberPagamento,
            isEditavel,
            mapper.toDTOList(pagamentos)
        );
    }

    @Transactional(readOnly = true)
    public List<AgendamentoPagamentoDTO> listarPagamentos(UUID agendamentoId) {
        List<AgendamentoPagamento> pagamentos = pagamentoRepository
            .findByIdAgendamentoOrderByDataRecebimentoDesc(agendamentoId);
        return mapper.toDTOList(pagamentos);
    }

    @Transactional
    public AgendamentoPagamentoDTO adicionarPagamento(UUID agendamentoId, AgendamentoPagamentoRequestDTO request) {
        Agendamento agendamento = findAgendamentoOrThrow(agendamentoId);

        validarPagamento(agendamento, request);

        AgendamentoPagamento pagamento = mapper.toEntity(request);
        pagamento.setIdAgendamento(agendamentoId);
        pagamento.setCreatedBy(securityContext.getUsuarioIdLogado());

        AgendamentoPagamento pagamentoSalvo = pagamentoRepository.saveAndFlush(pagamento);

        atualizarStatusPagamentoAgendamento(agendamento);

        return mapper.toDTO(pagamentoSalvo);
    }

    @Transactional
    public void removerPagamento(UUID agendamentoId, UUID pagamentoId) {
        Agendamento agendamento = findAgendamentoOrThrow(agendamentoId);
        AgendamentoPagamento pagamento = pagamentoRepository.findById(pagamentoId)
            .orElseThrow(() -> new EntityNotFoundException("Pagamento não encontrado."));

        if (!pagamento.getIdAgendamento().equals(agendamentoId)) {
            throw new IllegalArgumentException("Pagamento não pertence a este agendamento.");
        }

        pagamentoRepository.delete(pagamento);
        pagamentoRepository.flush();

        atualizarStatusPagamentoAgendamento(agendamento);
    }

    private void atualizarStatusPagamentoAgendamento(Agendamento agendamento) {
        BigDecimal valorPagoTotal = pagamentoRepository.sumValorPagoByAgendamentoId(agendamento.getId());
        if (valorPagoTotal == null) {
            valorPagoTotal = BigDecimal.ZERO;
        }

        BigDecimal valorFinal = agendamento.getValorFinal();
        StatusPagamento novoStatus;

        if (valorPagoTotal.compareTo(valorFinal) >= 0) {
            novoStatus = StatusPagamento.PAGO;
        } else if (valorPagoTotal.compareTo(BigDecimal.ZERO) > 0) {
            novoStatus = StatusPagamento.PARCIAL;
        } else {
            novoStatus = StatusPagamento.PENDENTE;
        }

        if (!novoStatus.equals(agendamento.getStatusPagamento())) {
            agendamento.setStatusPagamento(novoStatus);
            agendamentoRepository.save(agendamento);
        }
    }

    private void validarPagamento(Agendamento agendamento, AgendamentoPagamentoRequestDTO request) {
        if (agendamento.isCancelado()) {
            throw new IllegalArgumentException("Não é possível adicionar pagamentos a agendamentos cancelados.");
        }

        if (request.valorPago().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do pagamento deve ser maior que zero.");
        }

        BigDecimal valorPagoTotal = pagamentoRepository.sumValorPagoByAgendamentoId(agendamento.getId());
        BigDecimal saldoRestante = agendamento.getValorFinal().subtract(valorPagoTotal);

        if (saldoRestante.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Este agendamento já está totalmente pago.");
        }

        if (request.valorPago().compareTo(saldoRestante) > 0) {
            throw new IllegalArgumentException(
                String.format("O valor do pagamento (R$ %.2f) não pode exceder o saldo restante (R$ %.2f).",
                    request.valorPago(), saldoRestante));
        }
    }

    private Agendamento findAgendamentoOrThrow(UUID agendamentoId) {
        return agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado."));
    }

}
