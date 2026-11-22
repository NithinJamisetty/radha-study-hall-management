package com.studyhall.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_chat_logs")
public class AdminChatLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rawMessage;

    @Column(columnDefinition = "TEXT")
    private String aiResponseJson;

    private Instant receivedAt = Instant.now();

    public AdminChatLog() {}

    public AdminChatLog(Admin admin, String rawMessage, String aiResponseJson) {
        this.admin = admin;
        this.rawMessage = rawMessage;
        this.aiResponseJson = aiResponseJson;
        this.receivedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }
    public String getRawMessage() { return rawMessage; }
    public void setRawMessage(String rawMessage) { this.rawMessage = rawMessage; }
    public String getAiResponseJson() { return aiResponseJson; }
    public void setAiResponseJson(String aiResponseJson) { this.aiResponseJson = aiResponseJson; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
}
