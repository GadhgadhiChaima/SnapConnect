package com.snapconnect.service;

import com.snapconnect.model.NotificationEntity;
import com.snapconnect.model.User;
import com.snapconnect.repository.NotificationRepository;
import com.snapconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationEntity> getNotificationsForUser(Long userId) {
        List<NotificationEntity> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (notifs.isEmpty()) {
            // Seed initial contextual notifications for a new creator or user
            userRepository.findById(userId).ifPresent(this::seedInitialNotifications);
            notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return notifs;
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<NotificationEntity> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifs.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifs);
    }

    @Transactional
    public NotificationEntity notifyUser(Long userId, String type, String title, String body, String link) {
        if (userId == null) return null;
        NotificationEntity n = NotificationEntity.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        NotificationEntity saved = notificationRepository.save(n);
        log.info("[Notification] Created for userId {}: {} ({})", userId, title, type);
        return saved;
    }

    private void seedInitialNotifications(User user) {
        if (user.getRole() != null && "CREATOR".equalsIgnoreCase(user.getRole().name())) {
            notifyUser(user.getId(), "SYSTEM",
                    "Bienvenue sur SnapConnect Studio Créateur !",
                    "Votre profil de créateur mobile est actif. Explorez les briefs clients et postulez aux tournages.",
                    "/jobs");
            notifyUser(user.getId(), "NEW_JOB",
                    "Nouvelle mission disponible à Tunis",
                    "Recherche vidéaste mobile pour 3 Reels TikTok 4K ProRes (Budget : 250 DT).",
                    "/jobs");
            notifyUser(user.getId(), "ESCROW",
                    "Garantie Séquestre SnapConnect",
                    "Tous vos paiements sont 100% garantis et bloqués sous séquestre avant chaque tournage.",
                    "/creator/earnings");
        } else {
            notifyUser(user.getId(), "SYSTEM",
                    "Bienvenue sur SnapConnect !",
                    "Trouvez les meilleurs vidéastes et photographes smartphone pour vos projets.",
                    "/creators");
        }
    }
}
