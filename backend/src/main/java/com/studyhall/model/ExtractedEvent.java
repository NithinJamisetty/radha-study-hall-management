package com.studyhall.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "extracted_events")
public class ExtractedEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_log_id")
    private AdminChatLog chatLog;

    @Column(nullable = false)
    private LocalDate eventDate = LocalDate.now();

    @Column(nullable = false)
    private String eventType; // ADMISSION, FEE_COLLECTION, ATTENDANCE, MAINTENANCE, GENERAL_NOTE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payloadJson;

    private boolean correction = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "corrected_event_id")
    private ExtractedEvent correctedEvent;

    private Instant createdAt = Instant.now();

    public ExtractedEvent() {}

    public ExtractedEvent(AdminChatLog chatLog, LocalDate eventDate, String eventType, String payloadJson) {
        this.chatLog = chatLog;
        this.eventDate = eventDate;
        this.eventType = eventType;
        this.payloadJson = payloadJson;
        this.correction = false;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public AdminChatLog getChatLog() { return chatLog; }
    public void setChatLog(AdminChatLog chatLog) { this.chatLog = chatLog; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public boolean isCorrection() { return correction; }
    public void setCorrection(boolean correction) { this.correction = correction; }
    public ExtractedEvent getCorrectedEvent() { return correctedEvent; }
    public void setCorrectedEvent(ExtractedEvent correctedEvent) { this.correctedEvent = correctedEvent; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
