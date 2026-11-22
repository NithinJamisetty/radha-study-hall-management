package com.studyhall.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fee_collections")
public class FeeCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(nullable = false)
    private BigDecimal amount;

    private String paymentMode = "CASH"; // CASH, UPI, BANK_TRANSFER
    private String remarks;
    private Integer studentCount = 1;
    private LocalDate collectionDate = LocalDate.now();
    private Instant createdAt = Instant.now();

    public FeeCollection() {}

    public FeeCollection(BigDecimal amount, Integer studentCount, String remarks, String paymentMode) {
        this.amount = amount;
        this.studentCount = studentCount != null ? studentCount : 1;
        this.remarks = remarks;
        this.paymentMode = paymentMode != null ? paymentMode : "CASH";
        this.collectionDate = LocalDate.now();
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
    public LocalDate getCollectionDate() { return collectionDate; }
    public void setCollectionDate(LocalDate collectionDate) { this.collectionDate = collectionDate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
