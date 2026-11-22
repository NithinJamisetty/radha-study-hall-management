package com.studyhall.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shift_attendance")
public class ShiftAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private LocalDate attendanceDate = LocalDate.now();

    private Integer morningCount = 0;
    private Integer afternoonCount = 0;
    private Integer eveningCount = 0;

    private Instant lastUpdatedAt = Instant.now();

    public ShiftAttendance() {}

    public ShiftAttendance(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
        this.morningCount = 0;
        this.afternoonCount = 0;
        this.eveningCount = 0;
        this.lastUpdatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }
    public Integer getMorningCount() { return morningCount; }
    public void setMorningCount(Integer morningCount) { this.morningCount = morningCount; }
    public Integer getAfternoonCount() { return afternoonCount; }
    public void setAfternoonCount(Integer afternoonCount) { this.afternoonCount = afternoonCount; }
    public Integer getEveningCount() { return eveningCount; }
    public void setEveningCount(Integer eveningCount) { this.eveningCount = eveningCount; }
    public Instant getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(Instant lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}
