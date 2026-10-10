package com.campusos.repository;

import com.campusos.domain.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByCourseOfferingId(UUID courseOfferingId);
    List<Enrollment> findByStudentId(UUID studentId);
    Optional<Enrollment> findByCourseOfferingIdAndStudentId(UUID courseOfferingId, UUID studentId);
}
