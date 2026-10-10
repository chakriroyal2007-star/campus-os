package com.campusos.repository;

import com.campusos.domain.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, UUID> {
    Optional<Institution> findByCode(String code);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Institution i WHERE LOWER(TRIM(i.code)) = LOWER(TRIM(:code))")
    Optional<Institution> findByCodeIgnoreCase(@org.springframework.data.repository.query.Param("code") String code);
}
