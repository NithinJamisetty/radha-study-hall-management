package com.studyhall.repository;

import com.studyhall.model.FeeCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FeeCollectionRepository extends JpaRepository<FeeCollection, UUID> {
    List<FeeCollection> findByCollectionDate(LocalDate collectionDate);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FeeCollection f WHERE f.collectionDate = :date")
    BigDecimal sumAmountByDate(@Param("date") LocalDate date);
}
