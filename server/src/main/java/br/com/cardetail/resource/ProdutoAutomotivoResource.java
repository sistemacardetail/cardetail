package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.ProdutoAutomotivo;
import br.com.cardetail.dto.ProdutoAutomotivoDTO;
import br.com.cardetail.service.ProdutoAutomotivoService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/produtos-automotivos")
public class ProdutoAutomotivoResource extends BaseResource<ProdutoAutomotivo, UUID> {

    private final ProdutoAutomotivoService service;

    @GetMapping("/list")
    public ResponseEntity<Page<ProdutoAutomotivoDTO>> getList(
            @RequestParam(name = "search", required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.findAllBySearch(search, pageable));
    }

}
