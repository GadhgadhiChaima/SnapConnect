package com.snapconnect.service;

import com.snapconnect.dto.ChatMessagePayload;
import com.snapconnect.dto.ConversationDto;
import com.snapconnect.dto.StartConversationRequest;
import com.snapconnect.model.ChatMessage;
import com.snapconnect.model.Conversation;
import com.snapconnect.model.User;
import com.snapconnect.repository.ChatMessageRepository;
import com.snapconnect.repository.ConversationRepository;
import com.snapconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapconnect.model.Role;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final ChatMessageRepository  chatMessageRepo;
    private final UserRepository         userRepo;

    // ─────────────────────────────────────────────────────────────────
    // Conversations
    // ─────────────────────────────────────────────────────────────────

    /** Get all conversations for a user, projected to DTOs */
    @Transactional(readOnly = true)
    public List<ConversationDto> getConversationsForUser(Long userId) {
        return conversationRepo.findAllByUserId(userId).stream()
                .map(c -> toConversationDto(c, userId))
                .toList();
    }

    /**
     * Start or retrieve an existing conversation between two users.
     * Idempotent: returns existing conversation if it already exists.
     */
    @Transactional
    public ConversationDto startOrGetConversation(Long requesterId, StartConversationRequest req) {
        User requester = userRepo.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable (ID: " + requesterId + ")"));

        User other = resolveTargetUser(req);
        if (other == null) {
            throw new RuntimeException("Impossible d'identifier le créateur destinataire.");
        }

        Long otherId = other.getId();

        return conversationRepo.findByParticipants(requesterId, otherId)
                .map(c -> {
                    // Update avatars in conversation entity if either user updated their photo
                    boolean changed = false;
                    boolean isOne = requesterId.equals(c.getParticipantOneId());
                    String reqAvatar = requester.getAvatarUrl();
                    String othAvatar = other.getAvatarUrl();

                    if (reqAvatar != null && !reqAvatar.isBlank()) {
                        if (isOne && !reqAvatar.equals(c.getParticipantOneAvatar())) {
                            c.setParticipantOneAvatar(reqAvatar);
                            changed = true;
                        } else if (!isOne && !reqAvatar.equals(c.getParticipantTwoAvatar())) {
                            c.setParticipantTwoAvatar(reqAvatar);
                            changed = true;
                        }
                    }
                    if (othAvatar != null && !othAvatar.isBlank()) {
                        if (isOne && !othAvatar.equals(c.getParticipantTwoAvatar())) {
                            c.setParticipantTwoAvatar(othAvatar);
                            changed = true;
                        } else if (!isOne && !othAvatar.equals(c.getParticipantOneAvatar())) {
                            c.setParticipantOneAvatar(othAvatar);
                            changed = true;
                        }
                    }
                    if (changed) {
                        conversationRepo.save(c);
                    }
                    return toConversationDto(c, requesterId);
                })
                .orElseGet(() -> {
                    Conversation conv = Conversation.builder()
                            .participantOneId(requesterId)
                            .participantTwoId(otherId)
                            .participantOneName(requester.getFullName())
                            .participantTwoName(other.getFullName())
                            .participantOneAvatar(requester.getAvatarUrl())
                            .participantTwoAvatar(other.getAvatarUrl())
                            .contextType(req.contextType() != null && !req.contextType().isBlank() ? req.contextType() : "GENERAL")
                            .contextId(req.contextId())
                            .contextTitle(req.contextTitle())
                            .build();

                    Conversation saved = conversationRepo.save(conv);
                    return toConversationDto(saved, requesterId);
                });
    }

    private User resolveTargetUser(StartConversationRequest req) {
        // 1. Try by otherUserId if provided
        if (req.otherUserId() != null) {
            Optional<User> u = userRepo.findById(req.otherUserId());
            if (u.isPresent()) return u.get();
        }

        // 2. Try by otherUserEmail if provided
        if (req.otherUserEmail() != null && !req.otherUserEmail().isBlank()) {
            Optional<User> u = userRepo.findByEmail(req.otherUserEmail().trim().toLowerCase());
            if (u.isPresent()) return u.get();
        }

        // 3. Try by otherUserName if provided
        if (req.otherUserName() != null && !req.otherUserName().isBlank()) {
            List<User> matches = userRepo.findAll().stream()
                    .filter(u -> u.getFullName() != null && u.getFullName().equalsIgnoreCase(req.otherUserName().trim()))
                    .toList();
            if (!matches.isEmpty()) return matches.get(0);
        }

        // 4. If name or email provided but no user found in MySQL, create a dedicated CREATOR account!
        if ((req.otherUserName() != null && !req.otherUserName().isBlank()) ||
            (req.otherUserEmail() != null && !req.otherUserEmail().isBlank())) {

            String name = req.otherUserName() != null && !req.otherUserName().isBlank() ? req.otherUserName().trim() : "Créateur Mobile";
            String cleanSlug = name.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (cleanSlug.isBlank()) cleanSlug = "creator";
            String email = req.otherUserEmail() != null && !req.otherUserEmail().isBlank()
                    ? req.otherUserEmail().trim().toLowerCase()
                    : cleanSlug + "@snapconnect.tn";

            if (userRepo.existsByEmail(email)) {
                return userRepo.findByEmail(email).orElse(null);
            }

            User newCreator = User.builder()
                    .fullName(name)
                    .email(email)
                    .role(Role.CREATOR)
                    .avatarUrl(req.otherUserAvatar() != null && !req.otherUserAvatar().isBlank()
                            ? req.otherUserAvatar()
                            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                    .verified(true)
                    .active(true)
                    .onboarded(true)
                    .title(req.contextTitle() != null ? req.contextTitle() : "Vidéaste & Photographe Mobile Pro")
                    .bio("Créateur de contenu smartphone certifié sur SnapConnect.")
                    .location("Tunis, Tunisie")
                    .smartphoneModel("iPhone 16 Pro Max (4K ProRes)")
                    .hourlyRate(45.0)
                    .dailyRate(350.0)
                    .build();

            return userRepo.save(newCreator);
        }

        // 5. Fallback: find any existing CREATOR
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.CREATOR)
                .findFirst()
                .orElse(null);
    }

    // ─────────────────────────────────────────────────────────────────
    // Messages
    // ─────────────────────────────────────────────────────────────────

    /** Get all messages in a conversation */
    @Transactional(readOnly = true)
    public List<ChatMessagePayload> getMessages(Long conversationId) {
        return chatMessageRepo.findByConversationIdOrderBySentAtAsc(conversationId)
                .stream()
                .map(this::toPayload)
                .toList();
    }

    /**
     * Persist a new chat message and update conversation's lastMessage.
     * Returns the saved payload for broadcasting via STOMP.
     */
    @Transactional
    public ChatMessagePayload persistMessage(Long conversationId, Long senderId, String content) {
        User sender = userRepo.findById(senderId).orElseThrow();

        ChatMessage msg = ChatMessage.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .senderName(sender.getFullName())
                .senderAvatar(sender.getAvatarUrl())
                .content(content)
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepo.save(msg);

        // Update conversation's last message preview
        conversationRepo.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessage(content.length() > 100 ? content.substring(0, 97) + "…" : content);
            conv.setLastMessageAt(LocalDateTime.now());
            conversationRepo.save(conv);
        });

        return toPayload(saved);
    }

    /** Mark all messages in a conversation as read for a user */
    @Transactional
    public void markRead(Long conversationId, Long readerId) {
        chatMessageRepo.markAllReadInConversation(conversationId, readerId);
    }

    /** Count total unread messages for a user */
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return chatMessageRepo.countUnreadForUser(userId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Mapping helpers
    // ─────────────────────────────────────────────────────────────────

    private ConversationDto toConversationDto(Conversation c, Long viewerId) {
        boolean viewerIsOne = viewerId.equals(c.getParticipantOneId());
        Long    otherId     = viewerIsOne ? c.getParticipantTwoId()   : c.getParticipantOneId();
        String  otherName   = viewerIsOne ? c.getParticipantTwoName() : c.getParticipantOneName();
        String  otherAvatar = viewerIsOne ? c.getParticipantTwoAvatar() : c.getParticipantOneAvatar();

        // Dynamically resolve the latest user profile photo and name from database
        if (otherId != null) {
            User otherUser = userRepo.findById(otherId).orElse(null);
            if (otherUser != null) {
                if (otherUser.getFullName() != null && !otherUser.getFullName().isBlank()) {
                    otherName = otherUser.getFullName();
                }
                if (otherUser.getAvatarUrl() != null && !otherUser.getAvatarUrl().isBlank()) {
                    otherAvatar = otherUser.getAvatarUrl();
                }
            }
        }

        // Count unread messages in this specific conversation for this viewer
        long unread = chatMessageRepo.findByConversationIdOrderBySentAtAsc(c.getId())
                .stream()
                .filter(m -> !m.getSenderId().equals(viewerId) && !m.isRead())
                .count();

        return new ConversationDto(
                c.getId(),
                otherId,
                otherName,
                otherAvatar,
                c.getContextType(),
                c.getContextTitle(),
                c.getLastMessage(),
                c.getLastMessageAt(),
                unread,
                c.getCreatedAt()
        );
    }

    private ChatMessagePayload toPayload(ChatMessage m) {
        String senderAvatar = m.getSenderAvatar();
        String senderName   = m.getSenderName();

        if (m.getSenderId() != null) {
            User sender = userRepo.findById(m.getSenderId()).orElse(null);
            if (sender != null) {
                if (sender.getFullName() != null && !sender.getFullName().isBlank()) {
                    senderName = sender.getFullName();
                }
                if (sender.getAvatarUrl() != null && !sender.getAvatarUrl().isBlank()) {
                    senderAvatar = sender.getAvatarUrl();
                }
            }
        }

        return new ChatMessagePayload(
                m.getId(),
                m.getConversationId(),
                m.getSenderId(),
                senderName,
                senderAvatar,
                m.getContent(),
                "CHAT",
                m.isRead(),
                m.getSentAt()
        );
    }

    @Transactional(readOnly = true)
    public String getUserFullName(Long userId) {
        if (userId == null) return "";
        return userRepo.findById(userId).map(User::getFullName).orElse("");
    }
}
