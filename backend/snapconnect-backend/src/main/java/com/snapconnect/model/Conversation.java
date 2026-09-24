package com.snapconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The two participants — stored as "userId1:userId2" sorted to avoid duplicates */
    @Column(name = "participant_one_id", nullable = false)
    private Long participantOneId;

    @Column(name = "participant_two_id", nullable = false)
    private Long participantTwoId;

    @Column(name = "participant_one_name")
    private String participantOneName;

    @Column(name = "participant_two_name")
    private String participantTwoName;

    @Column(name = "participant_one_avatar", length = 1000)
    private String participantOneAvatar;

    @Column(name = "participant_two_avatar", length = 1000)
    private String participantTwoAvatar;

    /** Optional context: CONTRACT, JOB, SERVICE, GENERAL */
    @Column(name = "context_type")
    @Builder.Default
    private String contextType = "GENERAL";

    @Column(name = "context_id")
    private String contextId;

    @Column(name = "context_title")
    private String contextTitle;

    @Column(name = "last_message", length = 500)
    private String lastMessage;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastMessageAt = LocalDateTime.now();
    }
}
