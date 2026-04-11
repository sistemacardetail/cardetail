package br.com.cardetail.core.service;

import br.com.cardetail.core.domain.BaseDomain;
import br.com.cardetail.core.repository.BaseRepository;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;

import static org.springframework.util.Assert.isAssignable;

@Transactional
@NoArgsConstructor
@Getter
public class BaseService<T extends BaseDomain<K>, K extends Serializable> extends FindService<T, K>  implements InitializingBean {

    private final transient Logger log = LoggerFactory.getLogger(this.getClass());

    public BaseRepository<T, K> getBaseRepository() {
        return (BaseRepository)super.getRepository();
    }

    public T save(T entity) {

        this.beforeSave(entity);

        T saved = this.getBaseRepository().save(entity);

        this.getEm().flush();

        this.afterSave(saved);

        return saved;
    }

    public void delete(T entity) {

        this.beforeDelete(entity);

        this.getBaseRepository().delete(entity);

        this.getBaseRepository().flush();

        this.afterDelete(entity);
    }

    protected void beforeSave(T entity) {

    }

    protected void beforeDelete(T entity) {

    }

    protected void afterSave(T saved) {

    }

    protected void afterDelete(T deleted) {

    }

    @Override
    public void afterPropertiesSet() {

        isAssignable(BaseRepository.class, getRepository().getClass());
    }

}
