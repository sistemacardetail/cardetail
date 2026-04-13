package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.CrudPermissions;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.Cliente;
import br.com.cardetail.dto.ClienteAutocompleteDTO;
import br.com.cardetail.dto.ClienteDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.ClienteService;
import lombok.RequiredArgsConstructor;

@CrudPermissions(
        visualizar = PermissaoEnum.CLIENTES_VISUALIZAR,
        criar = PermissaoEnum.CLIENTES_CRIAR,
        atualizar = PermissaoEnum.CLIENTES_EDITAR,
        remover = PermissaoEnum.CLIENTES_EXCLUIR
)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/clientes")
public class ClienteResource extends BaseResource<Cliente, UUID> {

    private final ClienteService service;

    @GetMapping("/list")
    @RequiresPermission(PermissaoEnum.CLIENTES_VISUALIZAR)
    public ResponseEntity<Page<ClienteDTO>> getList(
            @RequestParam(name = "search", required = false, defaultValue = "") String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.findAllBySearch(search, pageable));
    }

    @GetMapping("/autocomplete")
    @RequiresPermission(PermissaoEnum.CLIENTES_VISUALIZAR)
    public ResponseEntity<List<ClienteAutocompleteDTO>> getListToAutocomplete(
            @RequestParam(name = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(service.findToAutocomplete(search));
    }

}
