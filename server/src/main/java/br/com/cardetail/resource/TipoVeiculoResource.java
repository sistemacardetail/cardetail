package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.TipoVeiculo;
import br.com.cardetail.enums.PermissaoEnum;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.CADASTROS_VISUALIZAR,
        criar = PermissaoEnum.CADASTROS_GERENCIAR,
        atualizar = PermissaoEnum.CADASTROS_GERENCIAR,
        remover = PermissaoEnum.CADASTROS_GERENCIAR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/tipos-veiculos")
public class TipoVeiculoResource extends BaseResource<TipoVeiculo, UUID> {

}
