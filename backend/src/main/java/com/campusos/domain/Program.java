package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "programs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"institution_id", "code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "degree_type", nullable = false, length = 50)
    private String degreeType; // UNDERGRADUATE, POSTGRADUATE

    @Column(name = "duration_years", nullable = false)
    @Builder.Default
    private Integer durationYears = 4;

    @CreationTimestamp
    private Instant createdAt;
}
