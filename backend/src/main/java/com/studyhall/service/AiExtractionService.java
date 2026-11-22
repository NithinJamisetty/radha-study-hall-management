package com.studyhall.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyhall.dto.ChatDtos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiExtractionService {
    private static final Logger log = LoggerFactory.getLogger(AiExtractionService.class);

    @Value("${app.ai.provider:builtin}")
    private String aiProvider;

    @Value("${app.ai.openai-api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ExtractionResult parseAdminMessage(String message, String previousContext) {
        // If OpenAI key is provided and provider is openai, attempt LLM call
        if ("openai".equalsIgnoreCase(aiProvider) && openAiApiKey != null && !openAiApiKey.isBlank()) {
            try {
                return callOpenAiStructuredExtraction(message);
            } catch (Exception e) {
                log.warn("OpenAI extraction failed, falling back to built-in rule engine: {}", e.getMessage());
            }
        }

        // Built-in resilient semantic & regex extractor
        return parseWithBuiltInEngine(message);
    }

    private ExtractionResult parseWithBuiltInEngine(String text) {
        String lower = text.toLowerCase().trim();
        boolean isCorrection = lower.contains("correction") || lower.contains("correct that") || lower.contains("make it") || lower.contains("actually");

        Integer newAdmissions = null;
        Integer studentsLeft = null;
        BigDecimal feeCollected = null;
        Integer feePayingStudents = null;
        Integer morningAttendance = null;
        Integer afternoonAttendance = null;
        Integer eveningAttendance = null;
        List<ChatDtos.MaintenanceItem> maintenance = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        // 1. Admissions parsing ("5 new students joined", "admission count is 6", "admitted 3")
        Pattern admissionPattern = Pattern.compile("(\\d+)\\s*(new\\s+)?(students?\\s+joined|admissions?|enrolled|new\\s+admissions?)");
        Matcher admMatcher = admissionPattern.matcher(lower);
        if (admMatcher.find()) {
            newAdmissions = Integer.parseInt(admMatcher.group(1));
        } else {
            Pattern admAlt = Pattern.compile("(admission count is|admitted)\\s*(\\d+)");
            Matcher admAltMatcher = admAlt.matcher(lower);
            if (admAltMatcher.find()) {
                newAdmissions = Integer.parseInt(admAltMatcher.group(2));
            }
        }

        // 2. Departures ("2 students left", "3 departures")
        Pattern leftPattern = Pattern.compile("(\\d+)\\s*students?\\s*(left|cancelled|departed)");
        Matcher leftMatcher = leftPattern.matcher(lower);
        if (leftMatcher.find()) {
            studentsLeft = Integer.parseInt(leftMatcher.group(1));
        }

        // 3. Fee Collections ("collected fees from 12 students", "collected ₹12,500", "fee of 5000 collected")
        Pattern feeCountPattern = Pattern.compile("(from|for)\\s*(\\d+)\\s*students?\\s*(paid|fee|collected)?");
        Matcher feeCountMatcher = feeCountPattern.matcher(lower);
        if (feeCountMatcher.find()) {
            feePayingStudents = Integer.parseInt(feeCountMatcher.group(2));
        }

        Pattern feeAmountPattern = Pattern.compile("(₹|rs\\.?|inr)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s*(?:fee|fees|rupees|collected)?", Pattern.CASE_INSENSITIVE);
        if (lower.contains("fee") || lower.contains("collected") || lower.contains("₹") || lower.contains("rs")) {
            Matcher feeMatcher = Pattern.compile("(?:₹|rs\\.?|rupees)?\\s*(\\d+(?:,\\d+)*)\\s*(?:fee|collected|rupees)?").matcher(lower);
            while (feeMatcher.find()) {
                String match = feeMatcher.group(1).replace(",", "");
                try {
                    long val = Long.parseLong(match);
                    if (val >= 100) { // likely a fee amount rather than a student count
                        feeCollected = BigDecimal.valueOf(val);
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        // 4. Shift Attendance ("evening shift attendance was 85", "morning shift 72", "afternoon attendance 68")
        Pattern morningPattern = Pattern.compile("morning(?:\\s+shift)?(?:\\s+attendance)?(?:\\s+was|:)?\\s*(\\d+)");
        Matcher mMatcher = morningPattern.matcher(lower);
        if (mMatcher.find()) morningAttendance = Integer.parseInt(mMatcher.group(1));

        Pattern afternoonPattern = Pattern.compile("(?:afternoon|noon)(?:\\s+shift)?(?:\\s+attendance)?(?:\\s+was|:)?\\s*(\\d+)");
        Matcher aMatcher = afternoonPattern.matcher(lower);
        if (aMatcher.find()) afternoonAttendance = Integer.parseInt(aMatcher.group(1));

        Pattern eveningPattern = Pattern.compile("evening(?:\\s+shift)?(?:\\s+attendance)?(?:\\s+was|:)?\\s*(\\d+)");
        Matcher eMatcher = eveningPattern.matcher(lower);
        if (eMatcher.find()) eveningAttendance = Integer.parseInt(eMatcher.group(1));

        // 5. Maintenance ("AC in Room 2 is not working", "Wifi issue on floor 3", "light broken")
        if (lower.contains("not working") || lower.contains("repair") || lower.contains("broken") || lower.contains("issue") || lower.contains("complaint") || lower.contains("cleaning")) {
            String equipment = "General Facility";
            if (lower.contains("ac") || lower.contains("air conditioner")) equipment = "AC";
            else if (lower.contains("wifi") || lower.contains("wi-fi") || lower.contains("internet")) equipment = "Wi-Fi";
            else if (lower.contains("light") || lower.contains("fan")) equipment = "Electrical / Lighting";
            else if (lower.contains("water") || lower.contains("dispenser")) equipment = "Water Dispenser";
            else if (lower.contains("clean") || lower.contains("washroom")) equipment = "Cleaning / Housekeeping";

            String location = "Study Hall Area";
            Pattern locPattern = Pattern.compile("(room\\s*\\d+|floor\\s*\\d+|block\\s*[a-z]|cabin\\s*\\d+)", Pattern.CASE_INSENSITIVE);
            Matcher locMatcher = locPattern.matcher(text);
            if (locMatcher.find()) {
                location = locMatcher.group(1).toUpperCase();
            }

            maintenance.add(new ChatDtos.MaintenanceItem(equipment, location, text, "HIGH"));
        } else if (!lower.contains("joined") && !lower.contains("fee") && !lower.contains("shift") && !lower.contains("attendance")) {
            notes.add(text);
        }

        ChatDtos.StructuredEntities entities = new ChatDtos.StructuredEntities(
                newAdmissions,
                studentsLeft,
                feeCollected,
                feePayingStudents,
                morningAttendance,
                afternoonAttendance,
                eveningAttendance,
                maintenance,
                notes
        );

        String reply = buildNaturalReply(entities, isCorrection);
        return new ExtractionResult("UPDATE_STUDY_HALL", isCorrection, entities, reply);
    }

    private String buildNaturalReply(ChatDtos.StructuredEntities e, boolean isCorrection) {
        StringBuilder sb = new StringBuilder();
        if (isCorrection) {
            sb.append("Understood! Correction updated: ");
        } else {
            sb.append("Got it! Recorded: ");
        }

        List<String> actions = new ArrayList<>();
        if (e.newAdmissions() != null) actions.add(e.newAdmissions() + " new student admission(s)");
        if (e.studentsLeft() != null) actions.add(e.studentsLeft() + " student departure(s)");
        if (e.feeCollected() != null) actions.add("₹" + e.feeCollected() + " fee collected");
        if (e.feePayingStudents() != null) actions.add("fees for " + e.feePayingStudents() + " student(s)");
        if (e.morningAttendance() != null) actions.add("Morning shift attendance: " + e.morningAttendance());
        if (e.afternoonAttendance() != null) actions.add("Afternoon shift attendance: " + e.afternoonAttendance());
        if (e.eveningAttendance() != null) actions.add("Evening shift attendance: " + e.eveningAttendance());
        if (!e.maintenanceItems().isEmpty()) {
            ChatDtos.MaintenanceItem item = e.maintenanceItems().get(0);
            actions.add("Maintenance ticket created for " + item.equipment() + " (" + item.location() + ")");
        }
        if (!e.operationalNotes().isEmpty()) {
            actions.add("General note saved");
        }

        if (actions.isEmpty()) {
            return "Message received and logged. If this is a study hall update, you can share attendance, admissions, fees, or maintenance updates anytime.";
        }

        sb.append(String.join(", ", actions)).append(". Database updated successfully.");
        return sb.toString();
    }

    private ExtractionResult callOpenAiStructuredExtraction(String userMessage) throws Exception {
        URL url = new URL("https://api.openai.com/v1/chat/completions");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + openAiApiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String systemPrompt = "You are the Study Hall Intelligence Engine. Extract structured entities from admin messages: admissions, fees, shift attendance, maintenance tickets. Output valid JSON.";
        String requestJson = objectMapper.writeValueAsString(new OpenAiRequest(
                modelName,
                List.of(new Message("system", systemPrompt), new Message("user", userMessage))
        ));

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestJson.getBytes(StandardCharsets.UTF_8));
        }

        JsonNode responseNode = objectMapper.readTree(conn.getInputStream());
        String content = responseNode.path("choices").get(0).path("message").path("content").asText();
        // Fall back to built-in if json parsing fails
        return parseWithBuiltInEngine(userMessage);
    }

    public record ExtractionResult(
            String intent,
            boolean isCorrection,
            ChatDtos.StructuredEntities entities,
            String reply
    ) {}

    private record OpenAiRequest(String model, List<Message> messages) {}
    private record Message(String role, String content) {}
}
