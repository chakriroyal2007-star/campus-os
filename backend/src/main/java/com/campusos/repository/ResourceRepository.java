package com.campusos.repository;

import com.campusos.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByCourseOfferingId(UUID courseOfferingId);
    List<Resource> findByInstitutionId(UUID institutionId);

    @Query("SELECT r FROM Resource r JOIN Enrollment e ON e.courseOffering = r.courseOffering WHERE e.student.id = :studentId AND r.isPublished = true")
    List<Resource> findPublishedForStudent(@Param("studentId") UUID studentId);
}
