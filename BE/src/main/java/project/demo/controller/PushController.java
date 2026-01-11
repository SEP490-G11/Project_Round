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
import project.demo.service.PushSubscriptionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/push")
public class PushController {

    private final PushSubscriptionService service;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody PushSubscriptionDto dto
    ) {
        service.subscribe(principal.getId(), dto);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        service.unsubscribe(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
