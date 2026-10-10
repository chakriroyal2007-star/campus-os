package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_opportunities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "opportunity_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedOpportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @CreationTimestamp
    private Instant savedAt;
}
