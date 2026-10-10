package com.campusos.repository;

import com.campusos.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByAttendanceSessionId(UUID attendanceSessionId);
    List<AttendanceRecord> findByStudentId(UUID studentId);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.student.id = :studentId AND ar.attendanceSession.courseOffering.id = :courseOfferingId")
    List<AttendanceRecord> findByStudentIdAndCourseOfferingId(@Param("studentId") UUID studentId, @Param("courseOfferingId") UUID courseOfferingId);

    Optional<AttendanceRecord> findByAttendanceSessionIdAndStudentId(UUID attendanceSessionId, UUID studentId);
}
