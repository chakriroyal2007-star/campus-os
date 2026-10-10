package com.campusos.repository;

import com.campusos.domain.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {
    List<Opportunity> findByInstitutionIdOrderByCreatedAtDesc(UUID institutionId);
}
