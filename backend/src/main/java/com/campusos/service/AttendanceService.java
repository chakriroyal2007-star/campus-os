package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.BadRequestException;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.exception.UnauthorizedException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceAuditEventRepository auditEventRepository;
    private final AttendancePolicyRepository policyRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final UserAccountRepository userRepository;

    @Transactional(readOnly = true)
    public OverallAttendanceSummaryDto getStudentOverallAttendance(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        UUID institutionId = student.getInstitution().getId();
        BigDecimal minThreshold = policyRepository.findByInstitutionId(institutionId)
                .map(AttendancePolicy::getMinimumPercentage)
                .orElse(new BigDecimal("75.00"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        int totalConductedAcrossAll = 0;
        int totalAttendedAcrossAll = 0;
        List<SubjectAttendanceSummaryDto> subjectSummaries = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            CourseOffering co = enrollment.getCourseOffering();
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseOfferingId(student.getId(), co.getId());

            int conducted = records.size();
            int attended = 0;
            int absent = 0;
            int late = 0;
            int excused = 0;

            for (AttendanceRecord r : records) {
                switch (r.getStatus()) {
                    case "PRESENT" -> attended++;
                    case "LATE" -> {
                        attended++; // counts towards attended
                        late++;
                    }
                    case "EXCUSED" -> {
                        attended++; // excused counts as attended or neutralized per policy
                        excused++;
                    }
                    case "ABSENT" -> absent++;
                }
            }

            totalConductedAcrossAll += conducted;
            totalAttendedAcrossAll += attended;

            BigDecimal currentPct = BigDecimal.ZERO;
            if (conducted > 0) {
                currentPct = BigDecimal.valueOf((double) attended / conducted * 100)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            boolean isEligible = currentPct.compareTo(minThreshold) >= 0;

            // Calculate recovery and buffer metrics
            int classesNeeded = 0;
            int maxAbsencesAllowed = 0;
            double target = minThreshold.doubleValue() / 100.0;

            if (conducted > 0) {
                if (currentPct.compareTo(minThreshold) < 0) {
                    // How many consecutive classes needed to reach target?
                    // (attended + x) / (conducted + x) >= target
                    // x >= (target * conducted - attended) / (1 - target)
                    if (target < 1.0) {
                        double needed = (target * conducted - attended) / (1.0 - target);
                        classesNeeded = Math.max(0, (int) Math.ceil(needed));
                    }
                } else {
                    // How many classes can be missed before falling below target?
                    // attended / (conducted + y) >= target
                    // conducted + y <= attended / target
                    // y <= (attended / target) - conducted
                    if (target > 0) {
                        double buffer = (attended / target) - conducted;
                        maxAbsencesAllowed = Math.max(0, (int) Math.floor(buffer));
                    }
                }
            }

            subjectSummaries.add(new SubjectAttendanceSummaryDto(
                    co.getId(),
                    co.getSubject().getCode(),
                    co.getSubject().getName(),
                    conducted,
                    attended,
                    absent,
                    late,
                    excused,
                    currentPct,
                    minThreshold,
                    isEligible,
                    classesNeeded,
                    maxAbsencesAllowed
            ));
        }

        BigDecimal overallPct = BigDecimal.ZERO;
        if (totalConductedAcrossAll > 0) {
            overallPct = BigDecimal.valueOf((double) totalAttendedAcrossAll / totalConductedAcrossAll * 100)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new OverallAttendanceSummaryDto(
                totalConductedAcrossAll,
                totalAttendedAcrossAll,
                overallPct,
                minThreshold,
                subjectSummaries
        );
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getStudentSubjectAttendanceHistory(UUID studentUserId, UUID courseOfferingId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        boolean enrolled = enrollmentRepository.findByCourseOfferingId(courseOfferingId).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in this course offering.");
        }

        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseOfferingId(student.getId(), courseOfferingId);
        return records.stream().map(r -> new AttendanceRecordDto(
                r.getId(),
                student.getId(),
                student.getUser().getFullName(),
                student.getStudentIdNumber(),
                student.getSection(),
                r.getStatus(),
                r.getRemarks()
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseRosterStudentDto> getRosterForCourseOffering(UUID userId, UUID courseOfferingId) {
        CourseOffering co = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + courseOfferingId));

        verifyTeacherOrAdminAccess(userId, co);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseOfferingId(co.getId());

        return enrollments.stream().map(e -> {
            StudentProfile s = e.getStudent();
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseOfferingId(s.getId(), co.getId());
            int conducted = records.size();
            long attended = records.stream().filter(r -> "PRESENT".equals(r.getStatus()) || "LATE".equals(r.getStatus()) || "EXCUSED".equals(r.getStatus())).count();
            BigDecimal pct = conducted > 0
                    ? BigDecimal.valueOf((double) attended / conducted * 100).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return new CourseRosterStudentDto(
                    s.getId(),
                    s.getUser().getId(),
                    s.getUser().getFullName(),
                    s.getStudentIdNumber(),
                    s.getUser().getEmail(),
                    s.getSection(),
                    pct,
                    BigDecimal.ZERO
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceSessionDto recordAttendance(UUID recorderUserId, AttendanceSaveRequest req) {
        UserAccount recorder = userRepository.findById(recorderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recorderUserId));

        CourseOffering courseOffering = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));

        verifyTeacherOrAdminAccess(recorderUserId, courseOffering);

        AttendanceSession session = attendanceSessionRepository
                .findByCourseOfferingIdAndSessionDate(courseOffering.getId(), req.sessionDate())
                .orElseGet(() -> AttendanceSession.builder()
                        .courseOffering(courseOffering)
                        .sessionDate(req.sessionDate())
                        .recordedBy(recorder)
                        .isLocked(false)
                        .build());

        if (session.getIsLocked()) {
            throw new BadRequestException("This attendance session has been locked and cannot be overwritten directly. Use correction workflow.");
        }

        session = attendanceSessionRepository.save(session);
        final AttendanceSession savedSession = session;

        List<AttendanceRecordDto> resultRecords = new ArrayList<>();

        for (AttendanceRecordInput input : req.records()) {
            StudentProfile student = studentProfileRepository.findById(input.studentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + input.studentId()));

            Optional<AttendanceRecord> existing = attendanceRecordRepository.findByAttendanceSessionIdAndStudentId(savedSession.getId(), student.getId());

            AttendanceRecord record;
            if (existing.isPresent()) {
                record = existing.get();
                record.setStatus(input.status());
                record.setRemarks(input.remarks());
            } else {
                record = AttendanceRecord.builder()
                        .attendanceSession(savedSession)
                        .student(student)
                        .status(input.status())
                        .remarks(input.remarks())
                        .build();
            }
            record = attendanceRecordRepository.save(record);

            resultRecords.add(new AttendanceRecordDto(
                    record.getId(),
                    student.getId(),
                    student.getUser().getFullName(),
                    student.getStudentIdNumber(),
                    student.getSection(),
                    record.getStatus(),
                    record.getRemarks()
            ));
        }

        return new AttendanceSessionDto(
                savedSession.getId(),
                courseOffering.getId(),
                courseOffering.getSubject().getName(),
                savedSession.getSessionDate(),
                savedSession.getIsLocked(),
                resultRecords
        );
    }

    @Transactional
    public AttendanceRecordDto correctAttendanceRecord(UUID teacherUserId, AttendanceCorrectionRequest req) {
        UserAccount teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherUserId));

        AttendanceRecord record = attendanceRecordRepository.findById(req.recordId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + req.recordId()));

        verifyTeacherOrAdminAccess(teacherUserId, record.getAttendanceSession().getCourseOffering());

        String oldStatus = record.getStatus();
        record.setStatus(req.newStatus());
        record = attendanceRecordRepository.save(record);

        AttendanceAuditEvent audit = AttendanceAuditEvent.builder()
                .attendanceRecord(record)
                .changedBy(teacher)
                .oldStatus(oldStatus)
                .newStatus(req.newStatus())
                .reason(req.reason())
                .build();
        auditEventRepository.save(audit);

        StudentProfile student = record.getStudent();
        return new AttendanceRecordDto(
                record.getId(),
                student.getId(),
                student.getUser().getFullName(),
                student.getStudentIdNumber(),
                student.getSection(),
                record.getStatus(),
                record.getRemarks()
        );
    }

    private void verifyTeacherOrAdminAccess(UUID userId, CourseOffering co) {
        TeacherProfile teacher = teacherProfileRepository.findByUserId(userId).orElse(null);
        if (teacher != null) {
            if (!co.getInstitution().getId().equals(teacher.getInstitution().getId())) {
                throw new UnauthorizedException("Course offering does not belong to your institution.");
            }
            boolean assigned = teachingAssignmentRepository.findByCourseOfferingId(co.getId())
                    .stream().anyMatch(ta -> teacher.getId().equals(ta.getTeacher().getId()));
            if (!assigned) {
                throw new UnauthorizedException("You are not assigned to teach this course offering.");
            }
        } else {
            UserAccount user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            boolean isAdmin = user.getRoles().stream()
                    .anyMatch(r -> "ROLE_COLLEGE_ADMIN".equals(r.getRole()) || "ROLE_SUPER_ADMIN".equals(r.getRole()) || "ROLE_ADMIN".equals(r.getRole()));
            if (!isAdmin || !co.getInstitution().getId().equals(user.getInstitution().getId())) {
                throw new UnauthorizedException("You are not authorized to access this course offering.");
            }
        }
    }
}
