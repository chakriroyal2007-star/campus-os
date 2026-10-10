package com.campusos.repository;

import com.campusos.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByCourseOfferingId(UUID courseOfferingId);
    List<Assignment> findByCourseOfferingIdAndIsPublishedTrue(UUID courseOfferingId);

    @Query("SELECT a FROM Assignment a JOIN Enrollment e ON e.courseOffering = a.courseOffering WHERE e.student.id = :studentId AND a.isPublished = true ORDER BY a.dueDate ASC")
    List<Assignment> findPublishedForStudent(@Param("studentId") UUID studentId);
}
