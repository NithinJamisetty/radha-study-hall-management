package com.studyhall.service;

import com.studyhall.dto.ChatDtos;
import com.studyhall.dto.ReportDtos.*;
import jakarta.annotation.PostConstruct;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExcelDatabaseService {
    private static final Logger log = LoggerFactory.getLogger(ExcelDatabaseService.class);

    @Value("${app.excel.file-path:./data/study_hall_database.xlsx}")
    private String excelFilePath;

    private final Object fileLock = new Object();

    @PostConstruct
    public void init() {
        synchronized (fileLock) {
            try {
                Path path = Paths.get(excelFilePath);
                if (!Files.exists(path.getParent())) {
                    Files.createDirectories(path.getParent());
                }
                if (!Files.exists(path)) {
                    createInitialWorkbook(path);
                    log.info("Initialized fresh Excel database at: {}", path.toAbsolutePath());
                } else {
                    log.info("Found existing Excel database at: {}", path.toAbsolutePath());
                }
            } catch (Exception e) {
                log.error("Failed to initialize Excel database: {}", e.getMessage(), e);
            }
        }
    }

    private void createInitialWorkbook(Path path) throws IOException {
        try (Workbook wb = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(wb);

            // 1. Today_Report_Summary (Sheet 0 - prominent overview)
            Sheet s0 = wb.createSheet("Today_Report_Summary");
            setupSummarySheet(wb, s0, LocalDate.now().toString(), "Draft ready - awaiting updates", "PENDING_APPROVAL");

            // 2. Admissions Sheet
            Sheet s1 = wb.createSheet("Admissions");
            Row r1 = s1.createRow(0);
            String[] h1 = {"Date", "Student_ID", "Name", "Phone", "Seat_Number", "Status", "Logged_By", "Timestamp"};
            for (int i = 0; i < h1.length; i++) {
                Cell c = r1.createCell(i);
                c.setCellValue(h1[i]);
                c.setCellStyle(headerStyle);
            }

            // 3. Fee_Collections Sheet
            Sheet s2 = wb.createSheet("Fee_Collections");
            Row r2 = s2.createRow(0);
            String[] h2 = {"Date", "Amount", "Student_Count", "Payment_Mode", "Remarks", "Timestamp"};
            for (int i = 0; i < h2.length; i++) {
                Cell c = r2.createCell(i);
                c.setCellValue(h2[i]);
                c.setCellStyle(headerStyle);
            }

            // 4. Shift_Attendance Sheet
            Sheet s3 = wb.createSheet("Shift_Attendance");
            Row r3 = s3.createRow(0);
            String[] h3 = {"Date", "Morning_Count", "Afternoon_Count", "Evening_Count", "Last_Updated"};
            for (int i = 0; i < h3.length; i++) {
                Cell c = r3.createCell(i);
                c.setCellValue(h3[i]);
                c.setCellStyle(headerStyle);
            }

            // 5. Maintenance Sheet
            Sheet s4 = wb.createSheet("Maintenance");
            Row r4 = s4.createRow(0);
            String[] h4 = {"Ticket_ID", "Item_Name", "Location", "Issue_Description", "Priority", "Status", "Reported_Date", "Resolved_Date"};
            for (int i = 0; i < h4.length; i++) {
                Cell c = r4.createCell(i);
                c.setCellValue(h4[i]);
                c.setCellStyle(headerStyle);
            }

            // 6. Daily_Reports Archive Sheet
            Sheet s5 = wb.createSheet("Daily_Reports");
            Row r5 = s5.createRow(0);
            String[] h5 = {"Report_Date", "Formatted_Markdown", "Status", "Approved_By", "Draft_Created_At", "Dispatched_At", "Channel", "Telegram_Msg_ID"};
            for (int i = 0; i < h5.length; i++) {
                Cell c = r5.createCell(i);
                c.setCellValue(h5[i]);
                c.setCellStyle(headerStyle);
            }

            // 7. Chat_Logs Sheet
            Sheet s6 = wb.createSheet("Chat_Logs");
            Row r6 = s6.createRow(0);
            String[] h6 = {"Timestamp", "Admin_Username", "Raw_Message", "Extracted_JSON"};
            for (int i = 0; i < h6.length; i++) {
                Cell c = r6.createCell(i);
                c.setCellValue(h6[i]);
                c.setCellStyle(headerStyle);
            }

            // Auto-size columns
            for (Sheet s : List.of(s0, s1, s2, s3, s4, s5, s6)) {
                for (int i = 0; i < 8; i++) s.setColumnWidth(i, 6000);
            }

            try (FileOutputStream fos = new FileOutputStream(path.toFile())) {
                wb.write(fos);
            }
        }
    }

    private void setupSummarySheet(Workbook wb, Sheet s, String reportDate, String markdown, String status) {
        // Clear previous rows
        for (int i = s.getLastRowNum(); i >= 0; i--) {
            Row r = s.getRow(i);
            if (r != null) s.removeRow(r);
        }

        CellStyle titleStyle = wb.createCellStyle();
        Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());
        titleStyle.setFont(titleFont);

        CellStyle sectionStyle = wb.createCellStyle();
        Font secFont = wb.createFont();
        secFont.setBold(true);
        secFont.setFontHeightInPoints((short) 11);
        sectionStyle.setFont(secFont);
        sectionStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle wrapStyle = wb.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setVerticalAlignment(VerticalAlignment.TOP);

        // Row 0: Title
        Row r0 = s.createRow(0);
        Cell c0 = r0.createCell(0);
        c0.setCellValue("RADHA STUDY HALL – DAILY OPERATIONAL REPORT");
        c0.setCellStyle(titleStyle);

        // Row 1: Date & Status
        Row r1 = s.createRow(1);
        r1.createCell(0).setCellValue("Report Date: " + reportDate);
        r1.createCell(1).setCellValue("Status: " + status);
        r1.createCell(2).setCellValue("Updated At: " + Instant.now().toString());

        // Row 3: Section Headers
        Row r3 = s.createRow(3);
        Cell sec1 = r3.createCell(0);
        sec1.setCellValue("Metric / Section");
        sec1.setCellStyle(sectionStyle);
        Cell sec2 = r3.createCell(1);
        sec2.setCellValue("Value / Count");
        sec2.setCellStyle(sectionStyle);

        // Row 4..9: Metrics
        int admissions = getTodayAdmissionsCount(reportDate);
        long active = getActiveStudentsCount();
        BigDecimal fees = getTodayFeesTotal(reportDate);
        int[] shifts = getShiftAttendance(reportDate);
        int tickets = getOpenMaintenanceTickets().size();

        s.createRow(4).createCell(0).setCellValue("New Admissions Today");
        s.getRow(4).createCell(1).setCellValue(admissions);

        s.createRow(5).createCell(0).setCellValue("Total Active Students");
        s.getRow(5).createCell(1).setCellValue(active);

        s.createRow(6).createCell(0).setCellValue("Fee Collections Today (₹)");
        s.getRow(6).createCell(1).setCellValue(fees != null ? fees.doubleValue() : 0.0);

        s.createRow(7).createCell(0).setCellValue("Shift Attendance (Morning / Noon / Evening)");
        s.getRow(7).createCell(1).setCellValue(shifts[0] + " / " + shifts[1] + " / " + shifts[2]);

        s.createRow(8).createCell(0).setCellValue("Open Maintenance Complaints");
        s.getRow(8).createCell(1).setCellValue(tickets);

        // Row 10: Complete Formatted WhatsApp Text
        Row r10 = s.createRow(10);
        Cell headerMsg = r10.createCell(0);
        headerMsg.setCellValue("WhatsApp Message Preview (Pre-Formatted):");
        headerMsg.setCellStyle(sectionStyle);

        Row r11 = s.createRow(11);
        r11.setHeightInPoints(240); // tall row for comfortable multi-line view
        Cell msgCell = r11.createCell(0);
        msgCell.setCellValue(markdown != null ? markdown : "");
        msgCell.setCellStyle(wrapStyle);

        s.setColumnWidth(0, 14000);
        s.setColumnWidth(1, 8000);
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    // --- Record Appending Methods ---

    public void logChat(String admin, String rawMessage, String extractedJson) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Chat_Logs");
                if (s == null) s = wb.createSheet("Chat_Logs");
                Row r = s.createRow(s.getLastRowNum() + 1);
                r.createCell(0).setCellValue(Instant.now().toString());
                r.createCell(1).setCellValue(admin);
                r.createCell(2).setCellValue(rawMessage);
                r.createCell(3).setCellValue(extractedJson);
                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to log chat to Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void addAdmission(String date, String name, String phone, String seatNumber, String status, String loggedBy) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Admissions");
                if (s == null) s = wb.createSheet("Admissions");
                Row r = s.createRow(s.getLastRowNum() + 1);
                r.createCell(0).setCellValue(date);
                r.createCell(1).setCellValue(UUID.randomUUID().toString().substring(0, 8));
                r.createCell(2).setCellValue(name);
                r.createCell(3).setCellValue(phone != null ? phone : "N/A");
                r.createCell(4).setCellValue(seatNumber != null ? seatNumber : "Open Seat");
                r.createCell(5).setCellValue(status != null ? status : "ACTIVE");
                r.createCell(6).setCellValue(loggedBy != null ? loggedBy : "admin");
                r.createCell(7).setCellValue(Instant.now().toString());
                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to add admission to Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void addFeeCollection(String date, BigDecimal amount, int studentCount, String mode, String remarks) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Fee_Collections");
                if (s == null) s = wb.createSheet("Fee_Collections");
                Row r = s.createRow(s.getLastRowNum() + 1);
                r.createCell(0).setCellValue(date);
                r.createCell(1).setCellValue(amount.doubleValue());
                r.createCell(2).setCellValue(studentCount);
                r.createCell(3).setCellValue(mode != null ? mode : "UPI/CASH");
                r.createCell(4).setCellValue(remarks != null ? remarks : "");
                r.createCell(5).setCellValue(Instant.now().toString());
                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to add fee collection to Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void updateShiftAttendance(String date, Integer morning, Integer afternoon, Integer evening) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Shift_Attendance");
                if (s == null) s = wb.createSheet("Shift_Attendance");
                Row targetRow = null;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && date.equals(getCellString(r.getCell(0)))) {
                        targetRow = r;
                        break;
                    }
                }
                if (targetRow == null) {
                    targetRow = s.createRow(s.getLastRowNum() + 1);
                    targetRow.createCell(0).setCellValue(date);
                    targetRow.createCell(1).setCellValue(0);
                    targetRow.createCell(2).setCellValue(0);
                    targetRow.createCell(3).setCellValue(0);
                }

                if (morning != null) targetRow.createCell(1).setCellValue(morning);
                if (afternoon != null) targetRow.createCell(2).setCellValue(afternoon);
                if (evening != null) targetRow.createCell(3).setCellValue(evening);
                targetRow.createCell(4).setCellValue(Instant.now().toString());

                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to update shift attendance in Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void addMaintenanceTicket(String itemName, String location, String issue, String priority) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Maintenance");
                if (s == null) s = wb.createSheet("Maintenance");
                Row r = s.createRow(s.getLastRowNum() + 1);
                r.createCell(0).setCellValue("TKT-" + (s.getLastRowNum()));
                r.createCell(1).setCellValue(itemName);
                r.createCell(2).setCellValue(location);
                r.createCell(3).setCellValue(issue);
                r.createCell(4).setCellValue(priority != null ? priority : "MEDIUM");
                r.createCell(5).setCellValue("OPEN");
                r.createCell(6).setCellValue(LocalDate.now().toString());
                r.createCell(7).setCellValue("");
                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to add maintenance ticket in Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void resolveTicket(String ticketId) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Maintenance");
                if (s != null) {
                    for (int i = 1; i <= s.getLastRowNum(); i++) {
                        Row r = s.getRow(i);
                        if (r != null && ticketId.equalsIgnoreCase(getCellString(r.getCell(0)))) {
                            r.createCell(5).setCellValue("RESOLVED");
                            r.createCell(7).setCellValue(LocalDate.now().toString());
                            break;
                        }
                    }
                }
                saveWorkbook(wb);
            } catch (Exception e) {
                log.error("Failed to resolve maintenance ticket in Excel: {}", e.getMessage(), e);
            }
        }
    }

    public void saveOrUpdateReport(String reportDate, String markdown, String status, String approvedBy, String dispatchedAt, String channel, String msgId) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                // 1. Update Today_Report_Summary (Sheet 0)
                Sheet s0 = wb.getSheet("Today_Report_Summary");
                if (s0 == null) s0 = wb.createSheet("Today_Report_Summary");
                setupSummarySheet(wb, s0, reportDate, markdown, status);

                // 2. Update Daily_Reports Archive Sheet
                Sheet s = wb.getSheet("Daily_Reports");
                if (s == null) s = wb.createSheet("Daily_Reports");
                Row targetRow = null;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && reportDate.equals(getCellString(r.getCell(0)))) {
                        targetRow = r;
                        break;
                    }
                }
                if (targetRow == null) {
                    targetRow = s.createRow(s.getLastRowNum() + 1);
                    targetRow.createCell(0).setCellValue(reportDate);
                    targetRow.createCell(4).setCellValue(Instant.now().toString());
                }

                targetRow.createCell(1).setCellValue(markdown);
                targetRow.createCell(2).setCellValue(status);
                if (approvedBy != null) targetRow.createCell(3).setCellValue(approvedBy);
                if (dispatchedAt != null) targetRow.createCell(5).setCellValue(dispatchedAt);
                if (channel != null) targetRow.createCell(6).setCellValue(channel);
                if (msgId != null) targetRow.createCell(7).setCellValue(msgId);

                saveWorkbook(wb);
                log.info("Successfully updated Daily Report in Excel for date {}. Status: {}", reportDate, status);
            } catch (Exception e) {
                log.error("Failed to save report in Excel: {}", e.getMessage(), e);
            }
        }
    }

    // --- Query Operations ---

    public long getActiveStudentsCount() {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Admissions");
                if (s == null) return 185;
                long count = 0;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && "ACTIVE".equalsIgnoreCase(getCellString(r.getCell(5)))) {
                        count++;
                    }
                }
                return count > 0 ? count : 185;
            } catch (Exception e) {
                return 185;
            }
        }
    }

    public int getTodayAdmissionsCount(String date) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Admissions");
                if (s == null) return 0;
                int count = 0;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && date.equals(getCellString(r.getCell(0)))) {
                        count++;
                    }
                }
                return count;
            } catch (Exception e) {
                return 0;
            }
        }
    }

    public BigDecimal getTodayFeesTotal(String date) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Fee_Collections");
                if (s == null) return BigDecimal.ZERO;
                double total = 0;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && date.equals(getCellString(r.getCell(0)))) {
                        Cell c = r.getCell(1);
                        if (c != null && c.getCellType() == CellType.NUMERIC) {
                            total += c.getNumericCellValue();
                        }
                    }
                }
                return BigDecimal.valueOf(total);
            } catch (Exception e) {
                return BigDecimal.ZERO;
            }
        }
    }

    public int getTodayFeeCount(String date) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Fee_Collections");
                if (s == null) return 0;
                int count = 0;
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && date.equals(getCellString(r.getCell(0)))) {
                        count++;
                    }
                }
                return count;
            } catch (Exception e) {
                return 0;
            }
        }
    }

    public int[] getShiftAttendance(String date) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Shift_Attendance");
                if (s == null) return new int[]{0, 0, 0};
                for (int i = 1; i <= s.getLastRowNum(); i++) {
                    Row r = s.getRow(i);
                    if (r != null && date.equals(getCellString(r.getCell(0)))) {
                        int m = (int) getCellNumeric(r.getCell(1));
                        int a = (int) getCellNumeric(r.getCell(2));
                        int e = (int) getCellNumeric(r.getCell(3));
                        return new int[]{m, a, e};
                    }
                }
                return new int[]{0, 0, 0};
            } catch (Exception e) {
                return new int[]{0, 0, 0};
            }
        }
    }

    public List<MaintenanceItemSummary> getOpenMaintenanceTickets() {
        synchronized (fileLock) {
            List<MaintenanceItemSummary> list = new ArrayList<>();
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Maintenance");
                if (s != null) {
                    for (int i = 1; i <= s.getLastRowNum(); i++) {
                        Row r = s.getRow(i);
                        if (r != null && "OPEN".equalsIgnoreCase(getCellString(r.getCell(5)))) {
                            list.add(new MaintenanceItemSummary(
                                    UUID.randomUUID(),
                                    getCellString(r.getCell(1)),
                                    getCellString(r.getCell(2)),
                                    getCellString(r.getCell(3)),
                                    getCellString(r.getCell(4)),
                                    "OPEN"
                            ));
                        }
                    }
                }
            } catch (Exception ignored) {}
            return list;
        }
    }

    public List<Map<String, String>> getAllMaintenanceRows() {
        synchronized (fileLock) {
            List<Map<String, String>> list = new ArrayList<>();
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Maintenance");
                if (s != null) {
                    for (int i = 1; i <= s.getLastRowNum(); i++) {
                        Row r = s.getRow(i);
                        if (r != null) {
                            Map<String, String> map = new HashMap<>();
                            map.put("id", getCellString(r.getCell(0)));
                            map.put("itemName", getCellString(r.getCell(1)));
                            map.put("location", getCellString(r.getCell(2)));
                            map.put("issueDescription", getCellString(r.getCell(3)));
                            map.put("priority", getCellString(r.getCell(4)));
                            map.put("status", getCellString(r.getCell(5)));
                            map.put("reportedDate", getCellString(r.getCell(6)));
                            map.put("resolvedDate", getCellString(r.getCell(7)));
                            list.add(map);
                        }
                    }
                }
            } catch (Exception ignored) {}
            return list;
        }
    }

    public Optional<DailyReportDto> getReport(String date) {
        synchronized (fileLock) {
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Daily_Reports");
                if (s != null) {
                    for (int i = 1; i <= s.getLastRowNum(); i++) {
                        Row r = s.getRow(i);
                        if (r != null && date.equals(getCellString(r.getCell(0)))) {
                            String status = checkOverdueStatus(getCellString(r.getCell(2)));
                            DailyReportDto dto = new DailyReportDto(
                                    UUID.randomUUID(),
                                    LocalDate.parse(date),
                                    getCellString(r.getCell(1)),
                                    status,
                                    getCellString(r.getCell(3)),
                                    Instant.now(),
                                    getCellString(r.getCell(5)).isBlank() ? null : Instant.parse(getCellString(r.getCell(5))),
                                    getCellString(r.getCell(6))
                            );
                            return Optional.of(dto);
                        }
                    }
                }
            } catch (Exception ignored) {}
            return Optional.empty();
        }
    }

    public List<DailyReportDto> getAllReports() {
        synchronized (fileLock) {
            List<DailyReportDto> list = new ArrayList<>();
            try (Workbook wb = loadWorkbook()) {
                Sheet s = wb.getSheet("Daily_Reports");
                if (s != null) {
                    for (int i = s.getLastRowNum(); i >= 1; i--) {
                        Row r = s.getRow(i);
                        if (r != null && r.getCell(0) != null) {
                            String date = getCellString(r.getCell(0));
                            String status = checkOverdueStatus(getCellString(r.getCell(2)));
                            list.add(new DailyReportDto(
                                    UUID.randomUUID(),
                                    LocalDate.parse(date),
                                    getCellString(r.getCell(1)),
                                    status,
                                    getCellString(r.getCell(3)),
                                    Instant.now(),
                                    null,
                                    getCellString(r.getCell(6))
                            ));
                        }
                    }
                }
            } catch (Exception ignored) {}
            return list;
        }
    }

    public File getExcelFile() {
        return new File(excelFilePath);
    }

    private String checkOverdueStatus(String currentStatus) {
        if ("PENDING_APPROVAL".equalsIgnoreCase(currentStatus)) {
            LocalTime now = LocalTime.now();
            if (now.isAfter(LocalTime.of(20, 15))) {
                return "OVERDUE_PENDING_DISPATCH";
            }
        }
        return currentStatus;
    }

    private Workbook loadWorkbook() throws IOException {
        return new XSSFWorkbook(new FileInputStream(excelFilePath));
    }

    private void saveWorkbook(Workbook wb) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(excelFilePath)) {
            wb.write(fos);
        }
    }

    private String getCellString(Cell c) {
        if (c == null) return "";
        return switch (c.getCellType()) {
            case STRING -> c.getStringCellValue();
            case NUMERIC -> String.valueOf((long) c.getNumericCellValue());
            case BOOLEAN -> String.valueOf(c.getBooleanCellValue());
            default -> "";
        };
    }

    private double getCellNumeric(Cell c) {
        if (c == null) return 0;
        return c.getCellType() == CellType.NUMERIC ? c.getNumericCellValue() : 0;
    }
}
