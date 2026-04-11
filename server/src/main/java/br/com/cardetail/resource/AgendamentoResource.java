package br.com.cardetail.resource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.Agendamento;
import br.com.cardetail.dto.AgendamentoCalendarioDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.enums.StatusAgendamento;
import br.com.cardetail.service.AgendamentoCalendarioService;
import br.com.cardetail.service.AgendamentoService;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.AGENDAMENTOS_VISUALIZAR,
        criar = PermissaoEnum.AGENDAMENTOS_CRIAR,
        atualizar = PermissaoEnum.AGENDAMENTOS_EDITAR,
        remover = PermissaoEnum.AGENDAMENTOS_EXCLUIR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoResource extends BaseResource<Agendamento, UUID> {

    private final AgendamentoService service;
    private final AgendamentoCalendarioService calendarioService;

    @GetMapping("/calendario")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_VISUALIZAR)
    public ResponseEntity<List<AgendamentoCalendarioDTO>> getAgendamentosCalendario(
            @RequestParam String dataInicio,
            @RequestParam String dataFim) {

        LocalDateTime inicio = LocalDate.parse(dataInicio).atStartOfDay();
        LocalDateTime fim = LocalDate.parse(dataFim).atTime(LocalTime.MAX);

        List<AgendamentoCalendarioDTO> agendamentos = calendarioService.findByPeriodo(inicio, fim);

        return ResponseEntity.ok(agendamentos);
    }

    @GetMapping("/dia/{data}")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_VISUALIZAR)
    public ResponseEntity<List<AgendamentoCalendarioDTO>> getAgendamentosDia(
            @PathVariable String data) {

        LocalDateTime dataConsulta = LocalDate.parse(data).atStartOfDay();

        List<AgendamentoCalendarioDTO> agendamentos = calendarioService.findByDia(dataConsulta);

        return ResponseEntity.ok(agendamentos);
    }

    @PatchMapping("/{id}/status")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_EDITAR)
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String statusStr = body.get("status");
        StatusAgendamento status = StatusAgendamento.valueOf(statusStr);

        service.updateStatus(id, status);

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/datas")
    @RequiresPermission(PermissaoEnum.AGENDAMENTOS_EDITAR)
    public ResponseEntity<Void> updateDatas(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        LocalDateTime dataInicio = LocalDateTime.parse(body.get("dataPrevisaoInicio"));
        LocalDateTime dataFim = LocalDateTime.parse(body.get("dataPrevisaoFim"));

        service.updateDatas(id, dataInicio, dataFim);

        return ResponseEntity.ok().build();
    }

}
