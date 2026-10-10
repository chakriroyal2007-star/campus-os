package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendance_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendancePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "minimum_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal minimumPercentage = new BigDecimal("75.00");

    @Column(name = "late_grace_minutes", nullable = false)
    @Builder.Default
    private Integer lateGraceMinutes = 10;

    @CreationTimestamp
    private Instant createdAt;
}
