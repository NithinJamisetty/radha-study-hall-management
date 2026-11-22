package com.studyhall.controller;

import com.studyhall.dto.ReportDtos.*;
import com.studyhall.service.DailyReportService;
import com.studyhall.service.ExcelDatabaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ExcelDatabaseService excelDb;
    private final DailyReportService reportService;

    public DashboardController(
            ExcelDatabaseService excelDb,
            DailyReportService reportService) {
        this.excelDb = excelDb;
        this.reportService = reportService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardSummaryDto> getStats() {
        LocalDate today = LocalDate.now();
        String todayStr = today.toString();

        long activeStudents = excelDb.getActiveStudentsCount();
        int newAdmissions = excelDb.getTodayAdmissionsCount(todayStr);
        BigDecimal fee = excelDb.getTodayFeesTotal(todayStr);
        int feeCount = excelDb.getTodayFeeCount(todayStr);

        int[] shifts = excelDb.getShiftAttendance(todayStr);
        Integer morning = shifts[0] > 0 ? shifts[0] : null;
        Integer afternoon = shifts[1] > 0 ? shifts[1] : null;
        Integer evening = shifts[2] > 0 ? shifts[2] : null;

        List<MaintenanceItemSummary> recentMaintenance = excelDb.getOpenMaintenanceTickets();
        long openTicketsCount = recentMaintenance.size();

        DailyReportDto report = reportService.getReportForDate(today).orElse(null);

        DashboardSummaryDto dto = new DashboardSummaryDto(
                today,
                activeStudents,
                newAdmissions,
                0,
                fee != null ? fee : BigDecimal.ZERO,
                feeCount,
                morning,
                afternoon,
                evening,
                openTicketsCount,
                recentMaintenance,
                report
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<Map<String, String>>> getMaintenanceTickets() {
        return ResponseEntity.ok(excelDb.getAllMaintenanceRows());
    }

    @PatchMapping("/maintenance/{id}/resolve")
    public ResponseEntity<Map<String, String>> resolveTicket(@PathVariable String id) {
        excelDb.resolveTicket(id);
        return ResponseEntity.ok(Map.of("id", id, "status", "RESOLVED"));
    }
}
