package com.studyhall.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class TelegramNotificationService {
    private static final Logger log = LoggerFactory.getLogger(TelegramNotificationService.class);

    @Value("${app.reporting.telegram-bot-token:}")
    private String botToken;

    @Value("${app.reporting.telegram-chat-id:}")
    private String chatId;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String sendDailyReport(String markdownText) {
        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            log.info("Telegram Bot Token or Chat ID not configured. Simulating broadcast to Telegram:\n{}", markdownText);
            return "SIMULATED_MSG_" + System.currentTimeMillis();
        }

        try {
            String apiUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            Map<String, Object> payload = Map.of(
                    "chat_id", chatId,
                    "text", markdownText,
                    "parse_mode", "HTML"
            );

            try (OutputStream os = conn.getOutputStream()) {
                os.write(objectMapper.writeValueAsBytes(payload));
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                log.info("Daily report successfully dispatched to Telegram chat: {}", chatId);
                return "TG_" + System.currentTimeMillis();
            } else {
                log.error("Telegram API returned non-200 status code: {}", responseCode);
                return "FAILED_" + responseCode;
            }
        } catch (Exception e) {
            log.error("Error dispatching report to Telegram: {}", e.getMessage(), e);
            return "ERROR_" + e.getMessage();
        }
    }
}
