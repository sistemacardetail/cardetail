package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.Servico;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.ServicoService;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.SERVICOS_VISUALIZAR,
        criar = PermissaoEnum.SERVICOS_CRIAR,
        atualizar = PermissaoEnum.SERVICOS_EDITAR,
        remover = PermissaoEnum.SERVICOS_EXCLUIR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/servicos")
public class ServicoResource extends BaseResource<Servico, UUID> {

    final ServicoService service;

    @GetMapping("/pacote/{idTipoVeiculo}")
    public ResponseEntity<List<Servico>> getServicosPacote(@PathVariable UUID idTipoVeiculo) {
        return ResponseEntity.ok(service.getServicosPacote(idTipoVeiculo));
    }

    @GetMapping("/agendamento/{idTipoVeiculo}")
    public ResponseEntity<List<Servico>> getServicosAgendamento(
            @PathVariable UUID idTipoVeiculo,
            @RequestParam(name = "idPacote", required = false) UUID idPacote) {
        return ResponseEntity.ok(service.getServicosAgendamento(idTipoVeiculo, idPacote));
    }

}
