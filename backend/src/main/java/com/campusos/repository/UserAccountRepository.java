package com.campusos.repository;

import com.campusos.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmail(String email);

    @Query("SELECT u FROM UserAccount u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    Optional<UserAccount> findByEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT u FROM UserAccount u WHERE u.institution.id = :institutionId AND u.email = :email")
    Optional<UserAccount> findByInstitutionIdAndEmail(@Param("institutionId") UUID institutionId, @Param("email") String email);

    @Query("SELECT u FROM UserAccount u WHERE u.institution.id = :institutionId AND LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    Optional<UserAccount> findByInstitutionIdAndEmailIgnoreCase(@Param("institutionId") UUID institutionId, @Param("email") String email);

    boolean existsByInstitutionIdAndEmail(UUID institutionId, String email);

    @Query("SELECT COUNT(u) > 0 FROM UserAccount u WHERE u.institution.id = :institutionId AND LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    boolean existsByInstitutionIdAndEmailIgnoreCase(@Param("institutionId") UUID institutionId, @Param("email") String email);
}
