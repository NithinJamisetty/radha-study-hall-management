package com.studyhall.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "maintenance_tickets")
public class MaintenanceTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 1000)
    private String issueDescription;

    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT
    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED

    private LocalDate reportedDate = LocalDate.now();
    private LocalDate resolvedDate;
    private Instant createdAt = Instant.now();

    public MaintenanceTicket() {}

    public MaintenanceTicket(String itemName, String location, String issueDescription, String priority) {
        this.itemName = itemName;
        this.location = location;
        this.issueDescription = issueDescription;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = "OPEN";
        this.reportedDate = LocalDate.now();
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDate reportedDate) { this.reportedDate = reportedDate; }
    public LocalDate getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
