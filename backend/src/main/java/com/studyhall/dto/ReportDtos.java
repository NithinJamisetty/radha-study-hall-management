package com.studyhall.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ReportDtos {

    public record DailyReportDto(
            UUID id,
            LocalDate reportDate,
            String formattedMarkdown,
            String status,
            String approvedBy,
            Instant draftCreatedAt,
            Instant dispatchedAt,
            String dispatchChannel
    ) {}

    public record ReportApprovalRequest(
            String updatedMarkdown,
            String approvedByUsername,
            boolean dispatchImmediately
    ) {}

    public record DashboardSummaryDto(
            LocalDate today,
            long totalActiveStudents,
            int todayNewAdmissions,
            int todayStudentsLeft,
            BigDecimal todayFeeCollected,
            int todayFeePaidCount,
            Integer morningAttendance,
            Integer afternoonAttendance,
            Integer eveningAttendance,
            long openMaintenanceTickets,
            List<MaintenanceItemSummary> recentMaintenance,
            DailyReportDto todayReport
    ) {}

    public record MaintenanceItemSummary(
            UUID id,
            String item,
            String location,
            String issue,
            String priority,
            String status
    ) {}
}
