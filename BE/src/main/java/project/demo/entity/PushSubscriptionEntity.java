package project.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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
}
