package project.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.demo.dto.NotificationDtos;
import project.demo.entity.Notification;
import project.demo.entity.User;
import project.demo.enums.NotificationType;
import project.demo.repository.NotificationRepository;
import project.demo.repository.UserRepository;
import project.demo.spec.NotificationSpecifications;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationSocketService socketService;

    // 🔔 WEB PUSH (OPTIONAL – KHÔNG ĐƯỢC LÀM CRASH APP)
    private final Optional<WebPushService> webPushService;

    @Override
    @Transactional
    public void createNotification(
            Long recipientId,
            Long actorId,
            NotificationType type,
            String message,
            Long taskId
    ) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        User actor = null;
        if (actorId != null) {
            actor = userRepository.findById(actorId)
                    .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        }

        Notification n = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .taskId(taskId)
                .active(true)
                .build();

        notificationRepository.save(n);

        // ================= REALTIME (WEB SOCKET) =================
        try {
            socketService.sendToUser(
                    recipient.getId(),
                    NotificationDtos.toRealtime(n)
            );
        } catch (Exception e) {
            log.warn("WebSocket notify failed for user {}", recipient.getId(), e);
        }

        // ================= WEB PUSH (BROWSER ĐÓNG VẪN NHẬN) =================
        webPushService.ifPresent(push -> {
            try {
                push.pushToUser(
                        recipient.getId(),
                        "Task Management",
                        message
                );
            } catch (Exception e) {
                log.warn("WebPush failed for user {}", recipient.getId(), e);
            }
        });
    }

    // ================= QUERY =================

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDtos.NotificationResponse> listMyNotifications(
            Long meId,
            Boolean unreadOnly,
            NotificationType type,
            Instant from,
            Instant to,
            Pageable pageable
    ) {
        Specification<Notification> spec = NotificationSpecifications.activeOnly()
                .and(NotificationSpecifications.recipientId(meId))
                .and(NotificationSpecifications.unreadOnly(unreadOnly))
                .and(NotificationSpecifications.type(type))
                .and(NotificationSpecifications.createdFrom(from))
                .and(NotificationSpecifications.createdTo(to));

        return notificationRepository
                .findAll(spec, pageable)
                .map(NotificationDtos::fromEntity);
    }

    // ================= MARK READ =================

    @Override
    @Transactional
    public void markRead(Long meId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("NOTIFICATION_NOT_FOUND"));

        if (!n.isActive() || !n.getRecipient().getId().equals(meId)) {
            throw new RuntimeException("NOTIFICATION_NOT_FOUND");
        }

        if (n.getReadAt() == null) {
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        }
    }

    @Override
    @Transactional
    public void markAllRead(Long meId) {
        var list = notificationRepository
                .findAllByRecipientIdAndActiveTrueAndReadAtIsNull(meId);

        Instant now = Instant.now();
        for (var n : list) {
            n.setReadAt(now);
        }

        notificationRepository.saveAll(list);
    }
}
