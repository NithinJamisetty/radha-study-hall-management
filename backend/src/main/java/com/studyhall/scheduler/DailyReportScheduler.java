package com.studyhall.scheduler;

import com.studyhall.service.DailyReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DailyReportScheduler {
    private static final Logger log = LoggerFactory.getLogger(DailyReportScheduler.class);

    private final DailyReportService reportService;

    @Value("${app.reporting.auto-send-enabled:true}")
    private boolean autoSendEnabled;

    public DailyReportScheduler(DailyReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Triggered at 8:00 PM IST daily
     * Generates or updates the daily draft report ready for admin review.
     */
    @Scheduled(cron = "${app.reporting.draft-cron:0 0 20 * * *}")
    public void generateEveningDraft() {
        LocalDate today = LocalDate.now();
        log.info("Triggering 8:00 PM IST Daily Report Draft generation for date: {}", today);
        reportService.generateOrUpdateDraft(today);
    }

    /**
     * Triggered at 8:15 PM IST daily
     * If the admin has not manually approved/sent, auto-dispatches report as fallback.
     */
    @Scheduled(cron = "${app.reporting.auto-send-cron:0 15 20 * * *}")
    public void executeAutoSendFallback() {
        if (!autoSendEnabled) {
            log.info("Auto-send fallback is disabled in application configuration.");
            return;
        }

        LocalDate today = LocalDate.now();
        log.info("Triggering 8:15 PM IST Auto-send fallback check for date: {}", today);
        reportService.autoDispatchFallback(today);
    }
}
