package com.campusos.repository;

import com.campusos.domain.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, UUID> {
    Optional<TeacherProfile> findByUserId(UUID userId);
    List<TeacherProfile> findByInstitutionId(UUID institutionId);
}
