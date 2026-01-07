package project.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.demo.dto.PushSubscriptionDto;
import project.demo.entity.PushSubscriptionEntity;
import project.demo.repository.PushSubscriptionRepository;
import project.demo.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/push")
public class PushController {

    private final PushSubscriptionRepository repository;

    private Long uid(CustomUserDetails principal) {
        if (principal == null) {
            throw new RuntimeException("UNAUTHORIZED");
        }
        return principal.getId();
    }

    /**
     * FE gọi khi đăng nhập / load app
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody PushSubscriptionDto dto
    ) {
        Long userId = uid(principal);

        // optional: tránh duplicate
        repository.deleteByUserId(userId);

        PushSubscriptionEntity sub = new PushSubscriptionEntity();
        sub.setUserId(userId);
        sub.setEndpoint(dto.endpoint());
        sub.setP256dh(dto.keys().p256dh());
        sub.setAuth(dto.keys().auth());

        repository.save(sub);
        return ResponseEntity.ok().build();
    }

    /**
     * FE gọi khi logout
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        repository.deleteByUserId(uid(principal));
        return ResponseEntity.noContent().build();
    }
}
