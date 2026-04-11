package br.com.cardetail.resource;

import java.util.UUID;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.cardetail.core.resource.BaseResource;
import br.com.cardetail.domain.TipoProdutoAutomotivo;

@RestController
@RequestMapping("/api/tipos-produtos-automotivos")
public class TipoProdutoAutomotivoResource extends BaseResource<TipoProdutoAutomotivo, UUID> {

}
