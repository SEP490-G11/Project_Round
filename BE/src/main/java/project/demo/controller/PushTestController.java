package project.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.demo.security.CustomUserDetails;
import project.demo.service.WebPushService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/push")
public class PushTestController {

    private final WebPushService webPushService;

    @PostMapping("/test")
    public void testPush(@AuthenticationPrincipal CustomUserDetails user) {
        webPushService.pushToUser(
                user.getId(),
                "🔥 PUSH TEST BACKEND",
                "Push này gửi từ Spring Boot – dù bạn đã đóng trình duyệt"
        );
    }
}
