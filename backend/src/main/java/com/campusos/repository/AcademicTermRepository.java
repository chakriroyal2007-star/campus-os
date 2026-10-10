package com.campusos.repository;

import com.campusos.domain.AcademicTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicTermRepository extends JpaRepository<AcademicTerm, UUID> {
    List<AcademicTerm> findByInstitutionId(UUID institutionId);
    Optional<AcademicTerm> findByInstitutionIdAndIsCurrentTrue(UUID institutionId);
}
