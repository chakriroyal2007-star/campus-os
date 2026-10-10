package com.campusos.repository;

import com.campusos.domain.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID> {
    List<Grade> findByAssignmentId(UUID assignmentId);
    List<Grade> findByStudentId(UUID studentId);
    Optional<Grade> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);

    @Query("SELECT g FROM Grade g WHERE g.student.id = :studentId AND g.isPublished = true")
    List<Grade> findPublishedGradesForStudent(@Param("studentId") UUID studentId);
}
