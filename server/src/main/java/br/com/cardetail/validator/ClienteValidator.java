package br.com.cardetail.validator;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.cardetail.domain.Cliente;
import br.com.cardetail.domain.TelefoneCliente;
import br.com.cardetail.domain.Veiculo;
import br.com.cardetail.repository.ClienteRepository;
import br.com.cardetail.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ClienteValidator {

    private final ClienteRepository clienteRepository;
    private final VeiculoRepository veiculoRepository;
    private final VeiculoExcludeValidator veiculoExcludeValidator;

    public void validate(Cliente entity) {
        validateUniquePlacaVeiculo(entity);
        if (entity.hasTelefone()) {
            List<TelefoneCliente> telefones =  entity.getTelefones();

            validateUniqueTelefonePrincipal(telefones);
            validateUniqueNumeroTelefone(entity);
        }
        validateExcludeVeiculo(entity);
    }

    private void validateUniquePlacaVeiculo(final Cliente entity) {
        List<String> placas = entity.getVeiculos()
                .stream()
                .filter(Veiculo::hasPlaca)
                .map(Veiculo::getPlaca)
                .toList();

        boolean hasDuplicates = placas.size() != new HashSet<>(placas).size();

        if (hasDuplicates) {
            throw new IllegalArgumentException("Existem veículos com placa repetida.");
        }

        List<String> duplicated = clienteRepository.getPlacasRepetidas(entity.getId(), entity.getVeiculos()
                .stream()
                .map(Veiculo::getPlaca)
                .collect(Collectors.toSet()));

        if (!duplicated.isEmpty()) {
            final String message = duplicated.size() == 1
                    ? String.format("A placa %s já está cadastrada.", duplicated.getFirst())
                    : String.format("As placas %s já estão cadastradas.", String.join(", ", duplicated));
            throw new IllegalArgumentException(message);
        }
    }

    private void validateUniqueTelefonePrincipal(List<TelefoneCliente> telefones) {

        final long countPrincipal = telefones.stream()
                .filter(TelefoneCliente::isPrincipal)
                .count();

        if (countPrincipal == 0) {
            throw new IllegalArgumentException("Deve haver exatamente um telefone principal, mas não há nenhum.");
        }

        if (countPrincipal > 1) {
            throw new IllegalArgumentException("Deve haver exatamente um telefone principal, mas foram encontrados vários.");
        }

    }

    private void validateUniqueNumeroTelefone(Cliente cliente) {
        boolean hasDuplicates = cliente.getTelefones().stream()
                .map(TelefoneCliente::getNumero)
                .distinct()
                .count() != cliente.getTelefones().size();

        if (hasDuplicates) {
            throw new IllegalArgumentException("Existem telefones com número repetido.");
        }

        List<String> telefonesRepetidos = clienteRepository.getTelefonesRepetidos(cliente.getId(),
                cliente.getTelefones().stream()
                        .map(TelefoneCliente::getNumero)
                        .collect(Collectors.toSet()));

        if (!telefonesRepetidos.isEmpty()) {
            final String message = telefonesRepetidos.size() == 1
                    ? String.format("O telefone %s já está cadastrado.", telefonesRepetidos.getFirst())
                    : String.format("Os telefones %s já estão cadastrados.", String.join(", ", telefonesRepetidos));
            throw new IllegalArgumentException(message);
        }
    }

    private void validateExcludeVeiculo(final Cliente cliente) {
        final List<Veiculo> currentVeiculos = veiculoRepository.findByClienteId(cliente.getId());
        final List<Veiculo> newVeiculos = cliente.getVeiculos();

        final Set<UUID> newIds = newVeiculos.stream()
                .map(Veiculo::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        final List<Veiculo> removedVeiculos = currentVeiculos.stream()
                .filter(v -> !newIds.contains(v.getId()))
                .toList();

        if (removedVeiculos.isEmpty()) {
            return;
        }

        removedVeiculos.forEach(veiculoExcludeValidator::validate);
    }

}
