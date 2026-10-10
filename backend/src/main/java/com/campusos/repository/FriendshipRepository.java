package com.campusos.repository;

import com.campusos.domain.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    @Query("SELECT f FROM Friendship f WHERE f.requester.id = :userId OR f.addressee.id = :userId")
    List<Friendship> findByUser(@Param("userId") UUID userId);

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :u1 AND f.addressee.id = :u2) OR (f.requester.id = :u2 AND f.addressee.id = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") UUID u1, @Param("u2") UUID u2);
}
