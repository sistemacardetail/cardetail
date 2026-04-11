package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.NoRequiresPermission;
import br.com.cardetail.config.security.annotation.RequiresPermission;
import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.ConfiguracaoSistema;
import br.com.cardetail.dto.configuracao.ConfiguracaoSistemaDTO;
import br.com.cardetail.enums.Configuracao;
import br.com.cardetail.enums.PermissaoEnum;
import br.com.cardetail.service.ConfiguracaoSistemaService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/configuracoes-sistema")
@RequiredArgsConstructor
public class ConfiguracaoSistemaResource extends BaseResource<ConfiguracaoSistema, UUID> {

    private final ConfiguracaoSistemaService service;

    @NoRequiresPermission
    @GetMapping("/cor-primaria")
    public ResponseEntity<ConfiguracaoSistemaDTO> getCorPrimaria() {
        String valor = service.getValor(Configuracao.COR_PRIMARIA.getKey());
        return ResponseEntity.ok(new ConfiguracaoSistemaDTO(Configuracao.COR_PRIMARIA.getKey(), valor));
    }

    @PutMapping("/cor-primaria")
    @RequiresPermission(PermissaoEnum.CONFIGURACAO_SISTEMA_GERENCIAR)
    public ResponseEntity<ConfiguracaoSistemaDTO> setCorPrimaria(@RequestBody ConfiguracaoSistemaDTO dto) {
        ConfiguracaoSistema config = service.salvarConfiguracao(Configuracao.COR_PRIMARIA.getKey(), dto.valor());
        return ResponseEntity.ok(new ConfiguracaoSistemaDTO(config.getKey(), config.getValor()));
    }

}
