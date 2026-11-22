package com.studyhall.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyhall.dto.ChatDtos;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class StudyHallChatService {

    private final ExcelDatabaseService excelDb;
    private final AiExtractionService aiService;
    private final ReportTemplateService templateService;
    private final DailyReportService reportService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StudyHallChatService(
            ExcelDatabaseService excelDb,
            AiExtractionService aiService,
            ReportTemplateService templateService,
            DailyReportService reportService) {
        this.excelDb = excelDb;
        this.aiService = aiService;
        this.templateService = templateService;
        this.reportService = reportService;
    }

    public ChatDtos.ChatResponse processMessage(String rawText, String username) {
        String adminUser = (username == null || username.isBlank()) ? "admin" : username;
        String lower = rawText.toLowerCase().trim();
        LocalDate today = LocalDate.now();

        // 0. Check for bot training guidance ("report should be like this", "train report", "format like")
        if (lower.contains("report should be like this") || lower.contains("train bot") || lower.contains("guide report") || lower.contains("format the report as")) {
            String templateCandidate = rawText;
            int idx = rawText.indexOf(":");
            if (idx != -1 && idx < rawText.length() - 5) {
                templateCandidate = rawText.substring(idx + 1).trim();
            }
            templateService.setCustomTrainingPrompt(rawText);
            if (templateCandidate.contains("{") || templateCandidate.length() > 30) {
                templateService.setCustomReportTemplate(templateCandidate);
            }
            excelDb.logChat(adminUser, rawText, "{\"action\": \"TRAIN_REPORT_FORMAT\"}");

            // 4. Immediately update the Live Daily Report in Excel
        try {
            reportService.generateOrUpdateDraft(today);
        } catch (Exception e) {
            // log and continue
        }

        return new ChatDtos.ChatResponse(
                    UUID.randomUUID(),
                    "🎯 Understood! I have trained myself on your custom report format. All upcoming WhatsApp summaries and daily reports will now strictly follow this layout.",
                    "TRAIN_REPORT_FORMAT",
                    false,
                    new ChatDtos.StructuredEntities(null, null, null, null, null, null, null, java.util.List.of(), java.util.List.of("Custom report layout trained")),
                    Instant.now()
            );
        }

        // 1. AI semantic extraction
        AiExtractionService.ExtractionResult result = aiService.parseAdminMessage(rawText, "");

        String aiResponseJson;
        try {
            aiResponseJson = objectMapper.writeValueAsString(result.entities());
        } catch (Exception e) {
            aiResponseJson = "{}";
        }

        // 2. Log in Excel Chat_Logs sheet
        excelDb.logChat(adminUser, rawText, aiResponseJson);

        String todayStr = today.toString();
        ChatDtos.StructuredEntities entities = result.entities();

        // 3. Write into Excel sheets
        // Admissions
        if (entities.newAdmissions() != null && entities.newAdmissions() > 0) {
            for (int i = 1; i <= entities.newAdmissions(); i++) {
                excelDb.addAdmission(todayStr, "Student " + (excelDb.getActiveStudentsCount() + 1), "N/A", "Seat-" + (excelDb.getActiveStudentsCount() + 1), "ACTIVE", adminUser);
            }
        }

        // Fee Collections
        if (entities.feeCollected() != null && entities.feeCollected().signum() > 0) {
            excelDb.addFeeCollection(
                    todayStr,
                    entities.feeCollected(),
                    entities.feePayingStudents() != null ? entities.feePayingStudents() : 1,
                    "UPI/CASH",
                    rawText
            );
        }

        // Shift Attendance
        if (entities.morningAttendance() != null || entities.afternoonAttendance() != null || entities.eveningAttendance() != null) {
            excelDb.updateShiftAttendance(
                    todayStr,
                    entities.morningAttendance(),
                    entities.afternoonAttendance(),
                    entities.eveningAttendance()
            );
        }

        // Maintenance Tickets
        if (entities.maintenanceItems() != null) {
            for (ChatDtos.MaintenanceItem item : entities.maintenanceItems()) {
                excelDb.addMaintenanceTicket(
                        item.equipment(),
                        item.location(),
                        item.issue(),
                        item.priority()
                );
            }
        }

        // 4. Immediately update the Live Daily Report in Excel
        try {
            reportService.generateOrUpdateDraft(today);
        } catch (Exception e) {
            // log and continue
        }

        return new ChatDtos.ChatResponse(
                UUID.randomUUID(),
                result.reply(),
                result.intent(),
                result.isCorrection(),
                entities,
                Instant.now()
        );
    }
}
