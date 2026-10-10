package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false)
    private String title;

    @Column(name = "company_or_organizer", nullable = false)
    private String companyOrOrganizer;

    @Column(nullable = false, length = 50)
    private String type; // INTERNSHIP, HACKATHON, WORKSHOP, COMPETITION, SCHOLARSHIP

    @Column(length = 100)
    private String location;

    @Column
    private LocalDate deadline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "apply_url", nullable = false, length = 1024)
    private String applyUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @CreationTimestamp
    private Instant createdAt;
}
