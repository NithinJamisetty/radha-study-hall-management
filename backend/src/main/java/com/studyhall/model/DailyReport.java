package com.studyhall.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "daily_reports")
public class DailyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private LocalDate reportDate = LocalDate.now();

    @Column(columnDefinition = "TEXT", nullable = false)
    private String formattedMarkdown;

    @Column(columnDefinition = "TEXT")
    private String summaryJson;

    @Column(nullable = false)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED, SENT, AUTO_SENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Admin approvedBy;

    private Instant draftCreatedAt = Instant.now();
    private Instant dispatchedAt;
    private String dispatchChannel = "TELEGRAM";
    private String telegramMessageId;

    public DailyReport() {}

    public DailyReport(LocalDate reportDate, String formattedMarkdown, String summaryJson) {
        this.reportDate = reportDate;
        this.formattedMarkdown = formattedMarkdown;
        this.summaryJson = summaryJson;
        this.status = "PENDING_APPROVAL";
        this.draftCreatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
    public String getFormattedMarkdown() { return formattedMarkdown; }
    public void setFormattedMarkdown(String formattedMarkdown) { this.formattedMarkdown = formattedMarkdown; }
    public String getSummaryJson() { return summaryJson; }
    public void setSummaryJson(String summaryJson) { this.summaryJson = summaryJson; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Admin getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Admin approvedBy) { this.approvedBy = approvedBy; }
    public Instant getDraftCreatedAt() { return draftCreatedAt; }
    public void setDraftCreatedAt(Instant draftCreatedAt) { this.draftCreatedAt = draftCreatedAt; }
    public Instant getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(Instant dispatchedAt) { this.dispatchedAt = dispatchedAt; }
    public String getDispatchChannel() { return dispatchChannel; }
    public void setDispatchChannel(String dispatchChannel) { this.dispatchChannel = dispatchChannel; }
    public String getTelegramMessageId() { return telegramMessageId; }
    public void setTelegramMessageId(String telegramMessageId) { this.telegramMessageId = telegramMessageId; }
}
