package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_responses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_answer")
    private String selectedAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "awarded_marks", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal awardedMarks = BigDecimal.ZERO;

    @CreationTimestamp
    private Instant createdAt;
}
