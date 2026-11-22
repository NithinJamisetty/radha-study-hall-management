package com.studyhall.controller;

import com.studyhall.service.DailyReportService;
import com.studyhall.service.ReportTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
public class TemplateController {

    private final ReportTemplateService templateService;
    private final DailyReportService reportService;

    public TemplateController(ReportTemplateService templateService, DailyReportService reportService) {
        this.templateService = templateService;
        this.reportService = reportService;
    }

    @GetMapping("/template")
    public ResponseEntity<Map<String, String>> getTemplate() {
        return ResponseEntity.ok(Map.of(
                "template", templateService.getCustomReportTemplate(),
                "trainingPrompt", templateService.getCustomTrainingPrompt()
        ));
    }

    @PostMapping("/template")
    public ResponseEntity<Map<String, String>> updateTemplate(@RequestBody Map<String, String> body) {
        if (body.containsKey("template") && body.get("template") != null && !body.get("template").isBlank()) {
            templateService.setCustomReportTemplate(body.get("template"));
        }
        if (body.containsKey("trainingPrompt") && body.get("trainingPrompt") != null) {
            templateService.setCustomTrainingPrompt(body.get("trainingPrompt"));
        }
        // Regenerate today's draft with the newly trained template
        reportService.generateOrUpdateDraft(LocalDate.now());

        return ResponseEntity.ok(Map.of(
                "status", "TRAINING_SAVED",
                "message", "Bot has been trained successfully with the new report format!",
                "template", templateService.getCustomReportTemplate()
        ));
    }
}
