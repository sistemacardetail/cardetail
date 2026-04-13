package br.com.cardetail.resource;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.dto.VeiculoAutocompleteDTO;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.VeiculoService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/veiculos")
public class VeiculoResource {

    private final VeiculoService service;

    @GetMapping("/autocomplete")
    @RequiresPermission(PermissaoEnum.CLIENTES_VISUALIZAR)
    public ResponseEntity<List<VeiculoAutocompleteDTO>> getListToAutocomplete(
            @RequestParam(name = "search", required = false, defaultValue = "") String search,
            @RequestParam(name = "idCliente", required = false) UUID idCliente) {
        return ResponseEntity.ok(service.findToAutocomplete(idCliente, search));
    }

}
