package com.studyhall.repository;

import com.studyhall.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    long countByStatus(String status);
    List<Student> findByAdmissionDate(LocalDate admissionDate);
}
