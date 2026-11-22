package com.studyhall.repository;

import com.studyhall.model.ShiftAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShiftAttendanceRepository extends JpaRepository<ShiftAttendance, UUID> {
    Optional<ShiftAttendance> findByAttendanceDate(LocalDate attendanceDate);
}
