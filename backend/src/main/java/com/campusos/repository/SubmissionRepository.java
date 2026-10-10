package com.campusos.repository;

import com.campusos.domain.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByAssignmentId(UUID assignmentId);
    List<Submission> findByStudentId(UUID studentId);
    Optional<Submission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);
    Optional<Submission> findByAssignmentIdAndStudentIdAndVersionNumber(UUID assignmentId, UUID studentId, Integer versionNumber);
}
