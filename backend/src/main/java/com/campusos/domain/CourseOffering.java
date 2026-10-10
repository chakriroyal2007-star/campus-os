package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "course_offerings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"subject_id", "academic_term_id", "section"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseOffering {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "academic_term_id", nullable = false)
    private AcademicTerm academicTerm;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String section = "A";

    @CreationTimestamp
    private Instant createdAt;
}
