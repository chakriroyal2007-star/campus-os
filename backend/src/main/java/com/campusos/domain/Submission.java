package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"assignment_id", "student_id", "version_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "attachment_url", length = 1024)
    private String attachmentUrl;

    @Column(name = "attachment_filename", length = 255)
    private String attachmentFilename;

    @CreationTimestamp
    private Instant submittedAt;

    @Column(name = "is_late", nullable = false)
    @Builder.Default
    private Boolean isLate = false;

    @Column(name = "version_number", nullable = false)
    @Builder.Default
    private Integer versionNumber = 1;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;
}
