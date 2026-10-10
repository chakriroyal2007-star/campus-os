package com.campusos.repository;

import com.campusos.domain.TeachingAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeachingAssignmentRepository extends JpaRepository<TeachingAssignment, UUID> {
    List<TeachingAssignment> findByCourseOfferingId(UUID courseOfferingId);
    List<TeachingAssignment> findByTeacherId(UUID teacherId);
    Optional<TeachingAssignment> findByCourseOfferingIdAndTeacherId(UUID courseOfferingId, UUID teacherId);
}
