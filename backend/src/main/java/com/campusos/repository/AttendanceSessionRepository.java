package com.campusos.repository;

import com.campusos.domain.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findByCourseOfferingId(UUID courseOfferingId);
    Optional<AttendanceSession> findByCourseOfferingIdAndSessionDate(UUID courseOfferingId, LocalDate sessionDate);
}
