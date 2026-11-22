package com.studyhall.repository;

import com.studyhall.model.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, UUID> {
    List<MaintenanceTicket> findByStatusOrderByCreatedAtDesc(String status);
    List<MaintenanceTicket> findByReportedDate(LocalDate reportedDate);
    long countByStatus(String status);
}
