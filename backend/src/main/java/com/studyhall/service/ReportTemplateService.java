package com.studyhall.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class ReportTemplateService {
    private static final Logger log = LoggerFactory.getLogger(ReportTemplateService.class);

    private String customTrainingPrompt = "";
    private String customReportTemplate = """
            *RADHA STUDY HALL – DAILY REPORT*
            
            📅 {DATE}
            
            *1. Student Updates*
            • New admissions: {NEW_ADMISSIONS}
            • Total active students: {ACTIVE_STUDENTS}
            • Students departed: {STUDENTS_LEFT}
            
            *2. Fee Collection*
            • Total collected: ₹{TOTAL_FEES}
            • Students paid: {PAID_STUDENTS_COUNT}
            
            *3. Attendance*
            • Morning shift: {MORNING_ATTENDANCE}
            • Afternoon shift: {AFTERNOON_ATTENDANCE}
            • Evening shift: {EVENING_ATTENDANCE}
            
            *4. Maintenance & Facilities*
            {MAINTENANCE_SECTION}
            
            *5. Important Updates*
            • New students registered successfully
            • Daily operational audit completed
            
            _Generated automatically by Radha Study Hall Intelligence Engine_
            """;

    public String getCustomReportTemplate() {
        return customReportTemplate;
    }

    public void setCustomReportTemplate(String customReportTemplate) {
        this.customReportTemplate = customReportTemplate;
        log.info("Updated custom report template: {}", customReportTemplate);
    }

    public String getCustomTrainingPrompt() {
        return customTrainingPrompt;
    }

    public void setCustomTrainingPrompt(String customTrainingPrompt) {
        this.customTrainingPrompt = customTrainingPrompt;
        log.info("Updated custom bot training guidance: {}", customTrainingPrompt);
    }

    public String renderReport(
            LocalDate date,
            long activeStudents,
            int newAdmissions,
            int studentsLeft,
            String totalFees,
            int paidCount,
            int morning,
            int afternoon,
            int evening,
            String maintenanceText) {
        
        String formattedDate = date.format(DateTimeFormatter.ofPattern("d MMMM yyyy | EEEE"));

        return customReportTemplate
                .replace("{DATE}", formattedDate)
                .replace("{ACTIVE_STUDENTS}", String.valueOf(activeStudents))
                .replace("{NEW_ADMISSIONS}", String.valueOf(newAdmissions))
                .replace("{STUDENTS_LEFT}", String.valueOf(studentsLeft))
                .replace("{TOTAL_FEES}", totalFees)
                .replace("{PAID_STUDENTS_COUNT}", String.valueOf(paidCount))
                .replace("{MORNING_ATTENDANCE}", morning > 0 ? String.valueOf(morning) : "N/A")
                .replace("{AFTERNOON_ATTENDANCE}", afternoon > 0 ? String.valueOf(afternoon) : "N/A")
                .replace("{EVENING_ATTENDANCE}", evening > 0 ? String.valueOf(evening) : "N/A")
                .replace("{MAINTENANCE_SECTION}", (maintenanceText != null && !maintenanceText.isBlank()) ? maintenanceText : "• All appliances functional. Zero pending issues.");
    }
}
