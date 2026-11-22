package com.studyhall.controller;

import com.studyhall.dto.ReportDtos.DailyReportDto;
import com.studyhall.service.DailyReportService;
import com.studyhall.service.ExcelDatabaseService;
import com.studyhall.service.GoogleSheetsSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/sheets")
public class GoogleSheetsController {

    private final GoogleSheetsSyncService sheetsService;
    private final DailyReportService reportService;
    private final ExcelDatabaseService excelDb;

    public GoogleSheetsController(
            GoogleSheetsSyncService sheetsService,
            DailyReportService reportService,
            ExcelDatabaseService excelDb) {
        this.sheetsService = sheetsService;
        this.reportService = reportService;
        this.excelDb = excelDb;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(sheetsService.getSyncStatus());
    }

    /**
     * Webhook called by Google Sheets (via Apps Script or webhook trigger)
     * when an admin approves the report directly in the Google Spreadsheet.
     */
    @PostMapping("/webhook-approve")
    public ResponseEntity<Map<String, Object>> handleGoogleSheetApproval(
            @RequestBody(required = false) Map<String, Object> payload) {
        
        LocalDate today = LocalDate.now();
        DailyReportDto report = reportService.sendReportNow(today);

        String waText = report.formattedMarkdown()
                .replace("<b>", "*")
                .replace("</b>", "*")
                .replace("<strong>", "*")
                .replace("</strong>", "*");

        String encodedWaText = URLEncoder.encode(waText, StandardCharsets.UTF_8);
        String whatsappUrl = "https://api.whatsapp.com/send?text=" + encodedWaText;

        return ResponseEntity.ok(Map.of(
                "status", "APPROVED_AND_UPDATED",
                "message", "Daily report approved from Google Sheet and updated in Excel database!",
                "reportDate", today.toString(),
                "whatsappUrl", whatsappUrl,
                "markdown", report.formattedMarkdown()
        ));
    }

    /**
     * Live data export for Google Sheets IMPORTDATA or Apps Script pull.
     */
    @GetMapping("/live-data")
    public ResponseEntity<Map<String, Object>> getLiveData() {
        LocalDate today = LocalDate.now();
        DailyReportDto report = reportService.getReportForDate(today)
                .orElseGet(() -> reportService.generateOrUpdateDraft(today));

        long activeStudents = excelDb.getActiveStudentsCount();
        int admissions = excelDb.getTodayAdmissionsCount(today.toString());
        var fee = excelDb.getTodayFeesTotal(today.toString());
        int[] shifts = excelDb.getShiftAttendance(today.toString());

        return ResponseEntity.ok(Map.of(
                "date", today.toString(),
                "activeStudents", activeStudents,
                "newAdmissions", admissions,
                "todayFees", fee,
                "morningAttendance", shifts[0],
                "afternoonAttendance", shifts[1],
                "eveningAttendance", shifts[2],
                "status", report.status(),
                "reportMarkdown", report.formattedMarkdown()
        ));
    }
}
