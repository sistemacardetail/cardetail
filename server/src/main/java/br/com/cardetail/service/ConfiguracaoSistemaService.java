package br.com.cardetail.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.cardetail.core.service.BaseService;
import br.com.cardetail.domain.ConfiguracaoSistema;
import br.com.cardetail.repository.ConfiguracaoSistemaRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ConfiguracaoSistemaService extends BaseService<ConfiguracaoSistema, UUID> {

    private final ConfiguracaoSistemaRepository repository;

    public Optional<ConfiguracaoSistema> findByKey(String key) {
        return repository.findByKey(key);
    }

    public String getValor(String chave) {
        return repository.findByKey(chave)
                .map(ConfiguracaoSistema::getValor)
                .orElse(null);
    }

    public ConfiguracaoSistema salvarConfiguracao(String chave, String valor) {
        ConfiguracaoSistema config = repository.findByKey(chave)
                .orElseGet(() -> {
                    ConfiguracaoSistema nova = new ConfiguracaoSistema();
                    nova.setKey(chave);
                    return nova;
                });

        config.setValor(valor);
        return save(config);
    }

}
