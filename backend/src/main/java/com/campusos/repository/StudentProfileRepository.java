package com.campusos.repository;

import com.campusos.domain.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUserId(UUID userId);
    List<StudentProfile> findByInstitutionId(UUID institutionId);
    List<StudentProfile> findByDepartmentIdAndCurrentSemester(UUID departmentId, Integer semester);
}
