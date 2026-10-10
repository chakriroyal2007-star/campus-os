package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_offering_id", nullable = false)
    private CourseOffering courseOffering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private UserAccount createdBy;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "rubric_json", columnDefinition = "TEXT")
    private String rubricJson;

    @Column(name = "max_marks", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal maxMarks = new BigDecimal("100.00");

    @Column(name = "weightage_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weightagePercent = BigDecimal.ZERO;

    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "allow_late_submissions", nullable = false)
    @Builder.Default
    private Boolean allowLateSubmissions = true;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
