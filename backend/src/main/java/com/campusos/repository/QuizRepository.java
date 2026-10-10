package com.campusos.repository;

import com.campusos.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCourseOfferingId(UUID courseOfferingId);
    List<Quiz> findByCourseOfferingIdAndIsPublishedTrue(UUID courseOfferingId);

    @Query("SELECT q FROM Quiz q JOIN Enrollment e ON e.courseOffering = q.courseOffering WHERE e.student.id = :studentId AND q.isPublished = true")
    List<Quiz> findPublishedForStudent(@Param("studentId") UUID studentId);
}
