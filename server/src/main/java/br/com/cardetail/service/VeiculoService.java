package br.com.cardetail.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.cardetail.dto.VeiculoAutocompleteDTO;
import br.com.cardetail.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository repository;

    public List<VeiculoAutocompleteDTO> findToAutocomplete(final UUID idCliente, final String search) {
        return repository.findToAutocomplete(idCliente, search, Pageable.ofSize(15));
    }

}
