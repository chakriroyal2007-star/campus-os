package com.campusos.repository;

import com.campusos.domain.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendancePolicyRepository extends JpaRepository<AttendancePolicy, UUID> {
    Optional<AttendancePolicy> findByInstitutionId(UUID institutionId);
}
