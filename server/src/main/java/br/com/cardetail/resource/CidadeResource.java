package br.com.cardetail.resource;

import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.config.security.annotation.NoRequiresPermission;
import br.com.cardetail.core.resource.FindResource;
import br.com.cardetail.domain.Cidade;
import br.com.cardetail.service.CidadeService;
import lombok.RequiredArgsConstructor;

@NoRequiresPermission
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/cidades")
public class CidadeResource extends FindResource<Cidade, UUID> {

    private final CidadeService service;

    @GetMapping("/find-by-nome-and-uf")
    @NoRequiresPermission
    public ResponseEntity<Optional<Cidade>> findByNomeUf(@RequestParam String nome, @RequestParam String uf) {
        return ResponseEntity.ok(service.findByNomeUf(nome, uf));
    }

}
