package com.campusos.repository;

import com.campusos.domain.ClassCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassCancellationRepository extends JpaRepository<ClassCancellation, UUID> {
    List<ClassCancellation> findByClassSessionId(UUID classSessionId);
    Optional<ClassCancellation> findByClassSessionIdAndCancellationDate(UUID classSessionId, LocalDate cancellationDate);
}
