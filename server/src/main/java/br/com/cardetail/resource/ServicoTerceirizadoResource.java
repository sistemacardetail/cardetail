package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.ServicoTerceirizado;
import br.com.cardetail.enums.PermissaoEnum;

@CrudPermissions(
    visualizar = PermissaoEnum.SERVICOS_TERCEIRIZADOS_VISUALIZAR,
    criar = PermissaoEnum.SERVICOS_TERCEIRIZADOS_CRIAR,
    atualizar = PermissaoEnum.SERVICOS_TERCEIRIZADOS_EDITAR,
    remover = PermissaoEnum.SERVICOS_TERCEIRIZADOS_EXCLUIR
)
@RestController
@RequestMapping("/api/servicos-terceirizados")
public class ServicoTerceirizadoResource extends BaseResource<ServicoTerceirizado, UUID> {

}
