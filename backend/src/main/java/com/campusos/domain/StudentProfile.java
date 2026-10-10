package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"institution_id", "student_id_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(name = "student_id_number", nullable = false, length = 100)
    private String studentIdNumber;

    @Column(name = "batch_year", nullable = false)
    private Integer batchYear;

    @Column(name = "current_semester", nullable = false)
    @Builder.Default
    private Integer currentSemester = 1;

    @Column(length = 10)
    private String section;

    @Column(name = "enrollment_status", nullable = false, length = 50)
    @Builder.Default
    private String enrollmentStatus = "ACTIVE";

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
