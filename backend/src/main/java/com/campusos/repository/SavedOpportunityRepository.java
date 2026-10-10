package com.campusos.repository;

import com.campusos.domain.SavedOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedOpportunityRepository extends JpaRepository<SavedOpportunity, UUID> {
    List<SavedOpportunity> findByUserId(UUID userId);
    Optional<SavedOpportunity> findByUserIdAndOpportunityId(UUID userId, UUID opportunityId);
}
