package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.Pacote;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.PacoteService;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.PACOTES_VISUALIZAR,
        criar = PermissaoEnum.PACOTES_CRIAR,
        atualizar = PermissaoEnum.PACOTES_EDITAR,
        remover = PermissaoEnum.PACOTES_EXCLUIR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/pacotes")
public class PacoteResource extends BaseResource<Pacote, UUID> {

    private final PacoteService service;

    @GetMapping("/agendamento/{idTipoVeiculo}")
    public ResponseEntity<List<Pacote>> getPacotesAgendamento(@PathVariable UUID idTipoVeiculo) {
        return ResponseEntity.ok(service.getPacotesAgendamento(idTipoVeiculo));
    }

}
