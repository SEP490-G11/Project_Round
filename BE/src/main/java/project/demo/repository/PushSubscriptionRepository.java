package project.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.demo.entity.PushSubscriptionEntity;

import java.util.List;

public interface PushSubscriptionRepository
        extends JpaRepository<PushSubscriptionEntity, Long> {

    List<PushSubscriptionEntity> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
