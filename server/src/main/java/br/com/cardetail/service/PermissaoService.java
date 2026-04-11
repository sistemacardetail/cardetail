package br.com.cardetail.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import br.com.cardetail.dto.seguranca.PermissaoDTO;
import br.com.cardetail.repository.PermissaoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissaoService {

    private final PermissaoRepository repository;

    public List<PermissaoDTO> listarTodas() {
        return repository.findAllByOrderByModuloAscCodigoAsc().stream()
            .map(p -> new PermissaoDTO(p.getId(), p.getCodigo(), p.getDescricao(), p.getModulo()))
            .toList();
    }

    public Map<String, List<PermissaoDTO>> listarAgrupadasPorModulo() {
        return repository.findAllByOrderByModuloAscCodigoAsc().stream()
            .map(p -> new PermissaoDTO(p.getId(), p.getCodigo(), p.getDescricao(), p.getModulo()))
            .collect(Collectors.groupingBy(PermissaoDTO::modulo));
    }
}
