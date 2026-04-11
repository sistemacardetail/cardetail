package br.com.cardetail.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.FindService;
import br.com.cardetail.domain.Cidade;
import br.com.cardetail.repository.CidadeRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CidadeService extends FindService<Cidade, UUID> {

    private final CidadeRepository repository;

    public Optional<Cidade> findByNomeUf(final String nome, final String uf) {
        return repository.findByNomeUf(nome, uf);
    }

}
