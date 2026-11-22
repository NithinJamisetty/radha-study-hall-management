package com.studyhall.repository;

import com.studyhall.model.AdminChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminChatLogRepository extends JpaRepository<AdminChatLog, UUID> {
    List<AdminChatLog> findTop50ByOrderByReceivedAtDesc();
}
