package com.studyhall.controller;

import com.studyhall.dto.ReportDtos.*;
import com.studyhall.service.DailyReportService;
import com.studyhall.service.ExcelDatabaseService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final DailyReportService reportService;
    private final ExcelDatabaseService excelDb;

    public ReportController(DailyReportService reportService, ExcelDatabaseService excelDb) {
        this.reportService = reportService;
        this.excelDb = excelDb;
    }

    @GetMapping("/today")
    public ResponseEntity<DailyReportDto> getTodayReport() {
        LocalDate today = LocalDate.now();
        DailyReportDto report = reportService.getReportForDate(today)
                .orElseGet(() -> reportService.generateOrUpdateDraft(today));
        return ResponseEntity.ok(report);
    }

    @PostMapping("/generate")
    public ResponseEntity<DailyReportDto> triggerDraftGeneration(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        DailyReportDto report = reportService.generateOrUpdateDraft(targetDate);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{date}/approve")
    public ResponseEntity<DailyReportDto> approveAndSendReport(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody ReportApprovalRequest request) {
        DailyReportDto report = reportService.approveAndDispatch(date, request);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{date}/send-now")
    public ResponseEntity<DailyReportDto> sendReportNow(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyReportDto report = reportService.sendReportNow(date);
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<DailyReportDto>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/download-excel")
    public ResponseEntity<Resource> downloadExcelDatabase() {
        File file = excelDb.getExcelFile();
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"study_hall_database.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }
}
