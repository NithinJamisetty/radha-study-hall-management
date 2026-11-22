package com.studyhall;

import com.studyhall.dto.ChatDtos.*;
import com.studyhall.dto.ReportDtos.DailyReportDto;
import com.studyhall.service.DailyReportService;
import com.studyhall.service.ExcelDatabaseService;
import com.studyhall.service.StudyHallChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class StudyHallApplicationTests {

    @Autowired
    private StudyHallChatService chatService;

    @Autowired
    private DailyReportService reportService;

    @Autowired
    private ExcelDatabaseService excelDb;

    @Test
    void testFullAdminDayFlowAndDailyReport() {
        // 1. Admin logs admissions
        ChatResponse r1 = chatService.processMessage("Today 5 new students joined.", "admin");
        assertNotNull(r1);
        assertEquals(5, r1.extracted().newAdmissions());
        assertTrue(r1.reply().contains("5 new student admission"));

        // 2. Admin logs maintenance complaint
        ChatResponse r2 = chatService.processMessage("AC in Room 2 is not working.", "admin");
        assertFalse(r2.extracted().maintenanceItems().isEmpty());
        assertEquals("AC", r2.extracted().maintenanceItems().get(0).equipment());
        assertEquals("ROOM 2", r2.extracted().maintenanceItems().get(0).location());

        // 3. Admin logs fee collection
        ChatResponse r3 = chatService.processMessage("Collected fees from 12 students with total ₹12,500.", "admin");
        assertEquals(12, r3.extracted().feePayingStudents());
        assertNotNull(r3.extracted().feeCollected());

        // 4. Admin logs attendance
        ChatResponse r4 = chatService.processMessage("Evening shift attendance was 85.", "admin");
        assertEquals(85, r4.extracted().eveningAttendance());

        // 5. Admin makes a correction
        ChatResponse r5 = chatService.processMessage("Correction, today's admission count is 6, not 5.", "admin");
        assertTrue(r5.isCorrection());
        assertEquals(6, r5.extracted().newAdmissions());

        // 6. Generate Daily Report
        LocalDate today = LocalDate.now();
        DailyReportDto report = reportService.generateOrUpdateDraft(today);
        assertNotNull(report);
        assertTrue(report.status().contains("PENDING_APPROVAL") || report.status().contains("OVERDUE"));

        String markdown = report.formattedMarkdown();
        assertTrue(markdown.contains("RADHA STUDY HALL – DAILY REPORT"));
        assertTrue(markdown.contains("Evening shift: 85"));
        assertTrue(markdown.contains("ROOM 2 AC"));

        // 7. Verify Excel Database File
        assertTrue(excelDb.getExcelFile().exists());
        assertTrue(excelDb.getExcelFile().length() > 0);
    }
}
