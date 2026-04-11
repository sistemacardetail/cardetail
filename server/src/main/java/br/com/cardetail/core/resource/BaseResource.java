package br.com.cardetail.core.resource;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.core.exception.RestException;
import br.com.cardetail.core.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.Serializable;
import java.net.URI;
import java.util.Objects;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.springframework.util.Assert.isAssignable;

public class BaseResource<T extends BaseDomain<K>, K extends Serializable>
        extends FindResource<T, K> implements InitializingBean {

    public BaseService<T, K> getBaseService() {

        return (BaseService<T, K>) super.getService();
    }

    @PostMapping
    public ResponseEntity<T> save(@RequestBody @Valid T entity) {

        if (nonNull(entity.getId()) && Objects.nonNull(getBaseService().findOne(entity.getId()))) {

            throw RestException.conflict();
        }

        beforeSave(entity);

        T saved = getBaseService().save(entity);

        ServletUriComponentsBuilder builder = ServletUriComponentsBuilder.fromCurrentRequest();

        String ext = removePathExtension(builder);

        URI uriLocation = builder
                .path("/{id}{ext}")
                .buildAndExpand(saved.getId(), ext)
                .toUri();

        return ResponseEntity.created(uriLocation).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<T> update(@RequestBody @Valid T entity, @PathVariable("id") K id) {

        if (!getBaseService().getBaseRepository().existsById(id)) {

            throw RestException.notFound();
        }

        beforeUpdate(entity);

        T saved = getBaseService().save(entity);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable("id") K id) {

        T entity = getService().findOne(id);

        if (isNull(entity)) {

            throw RestException.notFound();
        }

        beforeRemove(entity);

        getBaseService().delete(entity);

        return ResponseEntity.ok().build();
    }

    public void beforeSave(T entity) {

    }

    public void beforeUpdate(T entity) {

    }

    public void beforeRemove(T entity) {

    }

    private String removePathExtension(ServletUriComponentsBuilder builder) {

        String ext = builder.removePathExtension();

        if (isNotBlank(ext)) {

            return ".".concat(ext);
        }

        return null;
    }

    @Override
    public void afterPropertiesSet() {

        isAssignable(BaseService.class, getService().getClass());
    }

}