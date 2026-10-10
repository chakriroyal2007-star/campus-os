package com.campusos.repository;

import com.campusos.domain.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {
    List<ClassSession> findByCourseOfferingId(UUID courseOfferingId);

    @Query("SELECT cs FROM ClassSession cs JOIN Enrollment e ON e.courseOffering = cs.courseOffering WHERE e.student.id = :studentId")
    List<ClassSession> findByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT cs FROM ClassSession cs JOIN TeachingAssignment ta ON ta.courseOffering = cs.courseOffering WHERE ta.teacher.id = :teacherId")
    List<ClassSession> findByTeacherId(@Param("teacherId") UUID teacherId);

    @Query("SELECT cs FROM ClassSession cs JOIN Enrollment e ON e.courseOffering = cs.courseOffering WHERE e.student.id = :studentId AND cs.dayOfWeek = :dayOfWeek")
    List<ClassSession> findByStudentIdAndDayOfWeek(@Param("studentId") UUID studentId, @Param("dayOfWeek") Integer dayOfWeek);
}
