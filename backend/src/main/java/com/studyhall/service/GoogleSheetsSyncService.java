package com.studyhall.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@Service
public class GoogleSheetsSyncService {
    private static final Logger log = LoggerFactory.getLogger(GoogleSheetsSyncService.class);

    @Value("${app.google.sheet-id:15dcIrq0md3SaOGwTTWMqt2AMZbdr9B4iVxJMzykTv7U}")
    private String sheetId;

    @Value("${app.google.webhook-url:}")
    private String webhookUrl;

    public Map<String, Object> getSyncStatus() {
        String sheetUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/edit";
        String csvExportUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/export?format=csv&gid=0";
        boolean accessible = testPublicAccess(csvExportUrl);

        return Map.of(
                "sheetId", sheetId,
                "sheetUrl", sheetUrl,
                "csvExportUrl", csvExportUrl,
                "isPubliclyAccessible", accessible,
                "statusMessage", accessible 
                    ? "Connected! Google Sheet is accessible for live automated sync." 
                    : "Sheet linked. To enable direct live read/write, set Share to 'Anyone with link' or deploy the provided 5-line Google Apps Script."
        );
    }

    private boolean testPublicAccess(String urlStr) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(3000);
            conn.setRequestMethod("GET");
            int code = conn.getResponseCode();
            return code == 200;
        } catch (Exception e) {
            return false;
        }
    }
}
