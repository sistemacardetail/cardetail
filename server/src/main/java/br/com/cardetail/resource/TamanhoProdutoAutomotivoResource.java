package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.TamanhoProdutoAutomotivo;

@RestController
@RequestMapping("/api/tamanhos-produtos-automotivos")
public class TamanhoProdutoAutomotivoResource extends BaseResource<TamanhoProdutoAutomotivo, UUID> {
}
