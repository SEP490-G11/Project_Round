package project.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.demo.dto.PushSubscriptionDto;
import project.demo.entity.PushSubscriptionEntity;
import project.demo.repository.PushSubscriptionRepository;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private final PushSubscriptionRepository repository;

    @Transactional
    public void subscribe(Long userId, PushSubscriptionDto dto) {

        PushSubscriptionEntity sub =
                repository.findByEndpoint(dto.endpoint())
                        .orElseGet(PushSubscriptionEntity::new);

        //UPDATE OWNER
        sub.setUserId(userId);
        sub.setEndpoint(dto.endpoint());
        sub.setP256dh(dto.keys().p256dh());
        sub.setAuth(dto.keys().auth());
        sub.touch();

        repository.save(sub);
    }

    /**
     * KHÔNG NÊN XOÁ SUBSCRIPTION KHI LOGOUT
     */
    @Transactional
    public void unsubscribe(Long userId) {
        // OPTIONAL:
        // chỉ xoá nếu user CHỦ ĐỘNG disable notification
    }
}
