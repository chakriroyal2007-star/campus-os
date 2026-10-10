package com.campusos.repository;

import com.campusos.domain.QuizResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizResponseRepository extends JpaRepository<QuizResponse, UUID> {
    List<QuizResponse> findByAttemptId(UUID attemptId);
    Optional<QuizResponse> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);
}
