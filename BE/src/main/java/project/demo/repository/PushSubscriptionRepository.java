package project.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import project.demo.entity.PushSubscriptionEntity;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository
        extends JpaRepository<PushSubscriptionEntity, Long> {

    List<PushSubscriptionEntity> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    Optional<PushSubscriptionEntity> findByEndpoint(String endpoint);

    List<PushSubscriptionEntity> findAllByUserId(Long userId);
}
