package com.campusos.repository;

import com.campusos.domain.CourseOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, UUID> {
    List<CourseOffering> findByInstitutionId(UUID institutionId);

    @Query("SELECT c FROM CourseOffering c JOIN Enrollment e ON e.courseOffering = c WHERE e.student.id = :studentId")
    List<CourseOffering> findByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT c FROM CourseOffering c JOIN TeachingAssignment t ON t.courseOffering = c WHERE t.teacher.id = :teacherId")
    List<CourseOffering> findByTeacherId(@Param("teacherId") UUID teacherId);
}
