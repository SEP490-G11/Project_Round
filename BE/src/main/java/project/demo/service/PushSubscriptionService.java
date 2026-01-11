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

        repository.deleteByUserId(userId);

        PushSubscriptionEntity sub = new PushSubscriptionEntity();
        sub.setUserId(userId);
        sub.setEndpoint(dto.endpoint());
        sub.setP256dh(dto.keys().p256dh());
        sub.setAuth(dto.keys().auth());

        repository.save(sub);
    }

    @Transactional
    public void unsubscribe(Long userId) {
        repository.deleteByUserId(userId);
    }
}