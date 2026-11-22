package com.studyhall.repository;

import com.studyhall.model.ExtractedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExtractedEventRepository extends JpaRepository<ExtractedEvent, UUID> {
    List<ExtractedEvent> findByEventDateOrderByCreatedAtAsc(LocalDate eventDate);
}
