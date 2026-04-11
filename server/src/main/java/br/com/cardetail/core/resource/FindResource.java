package br.com.cardetail.core.resource;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.core.exception.RestException;
import br.com.cardetail.core.json.JsonFilterFields;
import br.com.cardetail.core.metamodel.MetaModel;
import br.com.cardetail.core.metamodel.MetaModelLoader;
import br.com.cardetail.core.service.FindService;
import br.com.cardetail.core.utils.ReflectionUtils;
import com.google.common.base.Splitter;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.java.Log;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.Serializable;
import java.util.Arrays;
import java.util.logging.Level;

import static io.micrometer.common.util.StringUtils.isNotBlank;
import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;
import static org.springframework.util.Assert.isAssignable;

@Log
public abstract class FindResource<T extends BaseDomain<K>, K extends Serializable>
        implements InitializingBean {

    @Autowired
    @Getter
    @Setter
    private FindService<T, K> service;

    @Getter
    private final Class<T> typeOfEntity = ReflectionUtils.getClassParameterizedType(getClass());

    private MetaModel metaModel;

    public MetaModel getMetaModel() {

        if (nonNull(metaModel)) {

            return metaModel;
        }

        if (getTypeOfEntity().isAnnotationPresent(JsonFilterFields.class)) {

            return MetaModelLoader.newMetaModel(typeOfEntity,
                    Arrays.asList(getTypeOfEntity().getAnnotation(JsonFilterFields.class).of()));
        }

        return MetaModelLoader.newMetaModel(typeOfEntity);
    }

    @GetMapping()
    public ResponseEntity<Page<T>> findAll(@RequestParam(value = "search", required = false, defaultValue = "") String search,
                                           Pageable pageable) {

        return ResponseEntity.ok(service.findByRsql(search, pageable));
    }

    @GetMapping({"/model"})
    public ResponseEntity<MetaModel> model(@RequestParam(value = "path", defaultValue = "") String path,
                                           @RequestParam(value = "fields", defaultValue = "") String fields) {

        if (isNotBlank(fields)) {

            return ResponseEntity.ok(MetaModelLoader.newMetaModel(typeOfEntity,
                    Splitter.on(",").omitEmptyStrings().trimResults().splitToList(fields)));
        }

        MetaModel metaModelPath = getMetaModel();

        if (isNotBlank(path)) {

            metaModelPath = metaModelPath.byPath(path);
        }

        return ResponseEntity.ok(metaModelPath);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<T> findOne(@PathVariable("id") K id) {

        T entity = service.findOne(id);

        if (isNull(entity)) {

            throw RestException.notFound();
        }

        log.log(Level.FINER, "Returning entity", entity);

        return ResponseEntity.ok(entity);
    }

    @Override
    public void afterPropertiesSet() {

        isAssignable(FindService.class, getService().getClass());
    }

}
