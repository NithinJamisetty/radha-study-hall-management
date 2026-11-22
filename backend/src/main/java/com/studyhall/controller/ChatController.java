package com.studyhall.controller;

import com.studyhall.dto.ChatDtos.*;
import com.studyhall.service.StudyHallChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final StudyHallChatService chatService;

    public ChatController(StudyHallChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        ChatResponse response = chatService.processMessage(request.message(), request.username());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Object>> getChatHistory() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
