package com.campusos.repository;

import com.campusos.domain.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByQuizId(UUID quizId);
    Optional<QuizAttempt> findByQuizIdAndStudentId(UUID quizId, UUID studentId);
    List<QuizAttempt> findByStudentId(UUID studentId);
}
