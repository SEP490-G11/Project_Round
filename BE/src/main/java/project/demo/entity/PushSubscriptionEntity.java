package project.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "push_subscriptions")
@Getter
@Setter
public class PushSubscriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // user nhận notify
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 1000)
    private String endpoint;

    @Column(nullable = false, length = 255)
    private String p256dh;

    @Column(nullable = false, length = 255)
    private String auth;

    @Column(name = "last_seen")
    private Instant lastSeen;

    public void touch() {
        this.lastSeen = Instant.now();
    }
}
