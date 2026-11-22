package com.studyhall.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ChatDtos {

    public record ChatRequest(
            String message,
            String username
    ) {}

    public record ChatResponse(
            UUID messageId,
            String reply,
            String intent,
            boolean isCorrection,
            StructuredEntities extracted,
            Instant timestamp
    ) {}

    public record StructuredEntities(
            Integer newAdmissions,
            Integer studentsLeft,
            BigDecimal feeCollected,
            Integer feePayingStudents,
            Integer morningAttendance,
            Integer afternoonAttendance,
            Integer eveningAttendance,
            List<MaintenanceItem> maintenanceItems,
            List<String> operationalNotes
    ) {}

    public record MaintenanceItem(
            String equipment,
            String location,
            String issue,
            String priority
    ) {}
}
