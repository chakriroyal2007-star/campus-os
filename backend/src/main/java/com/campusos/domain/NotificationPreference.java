package com.campusos.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserAccount user;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private Boolean emailEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    @Builder.Default
    private Boolean inAppEnabled = true;

    @Column(name = "assignment_alerts", nullable = false)
    @Builder.Default
    private Boolean assignmentAlerts = true;

    @Column(name = "grade_alerts", nullable = false)
    @Builder.Default
    private Boolean gradeAlerts = true;

    @Column(name = "timetable_alerts", nullable = false)
    @Builder.Default
    private Boolean timetableAlerts = true;

    @Column(name = "attendance_alerts", nullable = false)
    @Builder.Default
    private Boolean attendanceAlerts = true;

    @CreationTimestamp
    private Instant createdAt;
}
