package project.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import project.demo.dto.NotificationDtos;

@Service
@RequiredArgsConstructor
public class NotificationSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(Long userId, NotificationDtos.RealtimeNotification payload) {
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                payload
        );
    }
}
