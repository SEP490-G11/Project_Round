package project.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import project.demo.repository.PushSubscriptionRepository;

import java.security.Security;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebPushService {

    private final PushSubscriptionRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.push.vapid.public-key}")
    private String publicKey;

    @Value("${app.push.vapid.private-key}")
    private String privateKey;

    @Value("${app.push.vapid.subject}")
    private String subject;

    private PushService pushService;

    @PostConstruct
    void init() throws Exception {

        // REGISTER BOUNCY CASTLE PROVIDER (QUAN TRỌNG)
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        pushService = new PushService();
        pushService.setPublicKey(publicKey);
        pushService.setPrivateKey(privateKey);
        pushService.setSubject(subject);
    }

    public void pushToUser(Long userId, String title, String body) {
        var payload = Map.of(
                "title", title,
                "body", body,
                "url", "/dashboard"
        );

        repository.findByUserId(userId).forEach(sub -> {
            try {
                var notification = new nl.martijndwars.webpush.Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        objectMapper.writeValueAsString(payload)
                );
                pushService.send(notification);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
