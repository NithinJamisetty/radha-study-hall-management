package com.studyhall.service;

import com.studyhall.dto.ReportDtos.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DailyReportService {

    private final ExcelDatabaseService excelDb;
    private final TelegramNotificationService telegramService;
    private final ReportTemplateService templateService;

    public DailyReportService(
            ExcelDatabaseService excelDb,
            TelegramNotificationService telegramService,
            ReportTemplateService templateService) {
        this.excelDb = excelDb;
        this.telegramService = telegramService;
        this.templateService = templateService;
    }

    public DailyReportDto generateOrUpdateDraft(LocalDate date) {
        String dateStr = date.toString();
        long activeStudents = excelDb.getActiveStudentsCount();
        int newAdmissions = excelDb.getTodayAdmissionsCount(dateStr);
        BigDecimal totalFee = excelDb.getTodayFeesTotal(dateStr);
        int feeCount = excelDb.getTodayFeeCount(dateStr);

        int[] shifts = excelDb.getShiftAttendance(dateStr);
        int morning = shifts[0];
        int afternoon = shifts[1];
        int evening = shifts[2];

        List<MaintenanceItemSummary> openTickets = excelDb.getOpenMaintenanceTickets();

        StringBuilder maintSb = new StringBuilder();
        if (openTickets.isEmpty()) {
            maintSb.append("• All facilities functional. Zero pending issues.");
        } else {
            for (MaintenanceItemSummary t : openTickets) {
                maintSb.append("• ").append(t.location()).append(" ").append(t.item()).append(" — ").append(t.issue()).append("\n");
            }
            maintSb.append("• Maintenance pending: ").append(openTickets.size());
        }

        // Render report through the trained custom template
        String text = templateService.renderReport(
                date,
                activeStudents,
                newAdmissions,
                0,
                totalFee != null ? totalFee.toString() : "0",
                feeCount,
                morning,
                afternoon,
                evening,
                maintSb.toString()
        );

        String status = "PENDING_APPROVAL";

        // Save into Excel
        excelDb.saveOrUpdateReport(dateStr, text, status, null, null, "WHATSAPP", null);

        return excelDb.getReport(dateStr).orElseThrow();
    }

    public DailyReportDto approveAndDispatch(LocalDate date, ReportApprovalRequest request) {
        String dateStr = date.toString();
        DailyReportDto current = excelDb.getReport(dateStr).orElseGet(() -> generateOrUpdateDraft(date));

        String markdown = (request.updatedMarkdown() != null && !request.updatedMarkdown().isBlank())
                ? request.updatedMarkdown()
                : current.formattedMarkdown();

        String status = "APPROVED";
        String dispatchedAt = null;
        String msgId = null;

        if (request.dispatchImmediately()) {
            msgId = telegramService.sendDailyReport(markdown);
            status = "SENT";
            dispatchedAt = Instant.now().toString();
        }

        excelDb.saveOrUpdateReport(dateStr, markdown, status, request.approvedByUsername(), dispatchedAt, "WHATSAPP", msgId);
        return excelDb.getReport(dateStr).orElseThrow();
    }

    public DailyReportDto sendReportNow(LocalDate date) {
        String dateStr = date.toString();
        DailyReportDto current = excelDb.getReport(dateStr).orElseGet(() -> generateOrUpdateDraft(date));

        String msgId = telegramService.sendDailyReport(current.formattedMarkdown());
        String dispatchedAt = Instant.now().toString();

        excelDb.saveOrUpdateReport(dateStr, current.formattedMarkdown(), "SENT", "admin", dispatchedAt, "WHATSAPP", msgId);
        return excelDb.getReport(dateStr).orElseThrow();
    }

    public void autoDispatchFallback(LocalDate date) {
        String dateStr = date.toString();
        Optional<DailyReportDto> opt = excelDb.getReport(dateStr);
        if (opt.isPresent()) {
            DailyReportDto report = opt.get();
            if ("PENDING_APPROVAL".equals(report.status()) || "APPROVED".equals(report.status()) || "OVERDUE_PENDING_DISPATCH".equals(report.status())) {
                String msgId = telegramService.sendDailyReport(report.formattedMarkdown());
                excelDb.saveOrUpdateReport(dateStr, report.formattedMarkdown(), "AUTO_SENT", "system_scheduler", Instant.now().toString(), "WHATSAPP", msgId);
            }
        }
    }

    public Optional<DailyReportDto> getReportForDate(LocalDate date) {
        return excelDb.getReport(date.toString());
    }

    public List<DailyReportDto> getAllReports() {
        return excelDb.getAllReports();
    }
}
