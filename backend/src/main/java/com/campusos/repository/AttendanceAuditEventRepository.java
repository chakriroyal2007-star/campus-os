package com.campusos.repository;

import com.campusos.domain.AttendanceAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceAuditEventRepository extends JpaRepository<AttendanceAuditEvent, UUID> {
    List<AttendanceAuditEvent> findByAttendanceRecordId(UUID attendanceRecordId);
}
