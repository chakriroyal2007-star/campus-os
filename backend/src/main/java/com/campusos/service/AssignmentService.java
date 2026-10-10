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
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final GradeRepository gradeRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserAccountRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<AssignmentDto> getStudentAssignments(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        List<Assignment> assignments = assignmentRepository.findPublishedForStudent(student.getId());

        return assignments.stream().map(a -> {
            Submission sub = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId()).orElse(null);
            Grade grade = gradeRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId())
                    .filter(Grade::getIsPublished).orElse(null);

            SubmissionDto subDto = sub != null ? mapSubmissionToDto(sub) : null;
            GradeDto gradeDto = grade != null ? mapGradeToDto(grade) : null;

            return new AssignmentDto(
                    a.getId(),
                    a.getCourseOffering().getId(),
                    a.getCourseOffering().getSubject().getName(),
                    a.getCourseOffering().getSubject().getCode(),
                    a.getTitle(),
                    a.getDescription(),
                    a.getInstructions(),
                    a.getRubricJson(),
                    a.getMaxMarks(),
                    a.getWeightagePercent(),
                    a.getDueDate(),
                    a.getIsPublished(),
                    a.getAllowLateSubmissions(),
                    a.getCreatedAt(),
                    subDto,
                    gradeDto,
                    0
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getCourseAssignmentsForTeacher(UUID teacherUserId, UUID courseOfferingId) {
        CourseOffering co = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + courseOfferingId));

        verifyTeacherOrAdminAccess(teacherUserId, co);

        List<Assignment> assignments = assignmentRepository.findByCourseOfferingId(courseOfferingId);
        return assignments.stream().map(a -> {
            int subCount = submissionRepository.findByAssignmentId(a.getId()).size();
            return new AssignmentDto(
                    a.getId(),
                    a.getCourseOffering().getId(),
                    a.getCourseOffering().getSubject().getName(),
                    a.getCourseOffering().getSubject().getCode(),
                    a.getTitle(),
                    a.getDescription(),
                    a.getInstructions(),
                    a.getRubricJson(),
                    a.getMaxMarks(),
                    a.getWeightagePercent(),
                    a.getDueDate(),
                    a.getIsPublished(),
                    a.getAllowLateSubmissions(),
                    a.getCreatedAt(),
                    null,
                    null,
                    subCount
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto createAssignment(UUID teacherUserId, CreateAssignmentRequest req) {
        UserAccount teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherUserId));

        CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));

        verifyTeacherOrAdminAccess(teacherUserId, co);

        Assignment assignment = Assignment.builder()
                .courseOffering(co)
                .createdBy(teacher)
                .title(req.title())
                .description(req.description())
                .instructions(req.instructions())
                .rubricJson(req.rubricJson())
                .maxMarks(req.maxMarks())
                .weightagePercent(req.weightagePercent() != null ? req.weightagePercent() : BigDecimal.ZERO)
                .dueDate(req.dueDate())
                .allowLateSubmissions(req.allowLateSubmissions())
                .isPublished(req.isPublished())
                .build();

        assignment = assignmentRepository.save(assignment);

        return new AssignmentDto(
                assignment.getId(),
                co.getId(),
                co.getSubject().getName(),
                co.getSubject().getCode(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getInstructions(),
                assignment.getRubricJson(),
                assignment.getMaxMarks(),
                assignment.getWeightagePercent(),
                assignment.getDueDate(),
                assignment.getIsPublished(),
                assignment.getAllowLateSubmissions(),
                assignment.getCreatedAt(),
                null,
                null,
                0
        );
    }

    @Transactional
    public SubmissionDto submitAssignment(UUID studentUserId, SubmitAssignmentRequest req) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        Assignment assignment = assignmentRepository.findById(req.assignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + req.assignmentId()));

        boolean enrolled = enrollmentRepository.findByCourseOfferingId(assignment.getCourseOffering().getId()).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in the course offering for this assignment.");
        }

        if (!assignment.getIsPublished()) {
            throw new BadRequestException("This assignment is not currently accepting submissions.");
        }

        Instant now = Instant.now();
        boolean isLate = now.isAfter(assignment.getDueDate());

        if (isLate && !assignment.getAllowLateSubmissions()) {
            throw new BadRequestException("The deadline for this assignment has passed and late submissions are not allowed.");
        }

        Optional<Submission> existing = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId());
        Submission submission;

        if (existing.isPresent()) {
            submission = existing.get();
            submission.setContentText(req.contentText());
            submission.setAttachmentUrl(req.attachmentUrl());
            submission.setAttachmentFilename(req.attachmentFilename());
            submission.setSubmittedAt(now);
            submission.setIsLate(isLate);
            submission.setVersionNumber(submission.getVersionNumber() + 1);
            submission.setIdempotencyKey(req.idempotencyKey());
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .student(student)
                    .contentText(req.contentText())
                    .attachmentUrl(req.attachmentUrl())
                    .attachmentFilename(req.attachmentFilename())
                    .submittedAt(now)
                    .isLate(isLate)
                    .versionNumber(1)
                    .idempotencyKey(req.idempotencyKey())
                    .build();
        }

        submission = submissionRepository.save(submission);
        return mapSubmissionToDto(submission);
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getAssignmentSubmissions(UUID teacherUserId, UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        verifyTeacherOrAdminAccess(teacherUserId, assignment.getCourseOffering());

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream().map(this::mapSubmissionToDto).collect(Collectors.toList());
    }

    @Transactional
    public GradeDto gradeSubmission(UUID teacherUserId, GradeSubmissionRequest req) {
        UserAccount teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherUserId));

        Assignment assignment = assignmentRepository.findById(req.assignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + req.assignmentId()));

        verifyTeacherOrAdminAccess(teacherUserId, assignment.getCourseOffering());

        StudentProfile student = studentProfileRepository.findById(req.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.studentId()));

        if (req.marksObtained().compareTo(assignment.getMaxMarks()) > 0 || req.marksObtained().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Marks obtained must be between 0 and maximum possible " + assignment.getMaxMarks());
        }

        Submission submission = req.submissionId() != null
                ? submissionRepository.findById(req.submissionId()).orElse(null)
                : submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId()).orElse(null);

        Optional<Grade> existing = gradeRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId());
        Grade grade;

        if (existing.isPresent()) {
            grade = existing.get();
            grade.setMarksObtained(req.marksObtained());
            grade.setFeedback(req.feedback());
            grade.setIsPublished(req.isPublished());
            grade.setGradedBy(teacher);
            grade.setSubmission(submission);
        } else {
            grade = Grade.builder()
                    .assignment(assignment)
                    .student(student)
                    .submission(submission)
                    .gradedBy(teacher)
                    .marksObtained(req.marksObtained())
                    .feedback(req.feedback())
                    .isPublished(req.isPublished())
                    .build();
        }

        grade = gradeRepository.save(grade);

        if (grade.getIsPublished()) {
            notificationService.createNotification(
                    student.getUser().getId(),
                    "Marks Published: " + assignment.getTitle(),
                    "Your grade for " + assignment.getTitle() + " has been published: " + grade.getMarksObtained() + " / " + assignment.getMaxMarks(),
                    "GRADE",
                    assignment.getId().toString()
            );
        }

        return mapGradeToDto(grade);
    }

    @Transactional(readOnly = true)
    public List<StudentGradebookSummaryDto> getStudentGradebook(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        List<Grade> publishedGrades = gradeRepository.findPublishedGradesForStudent(student.getId());

        Map<UUID, List<Grade>> gradesByCourse = publishedGrades.stream()
                .collect(Collectors.groupingBy(g -> g.getAssignment().getCourseOffering().getId()));

        List<StudentGradebookSummaryDto> summaries = new ArrayList<>();
        for (Map.Entry<UUID, List<Grade>> entry : gradesByCourse.entrySet()) {
            List<Grade> list = entry.getValue();
            if (list.isEmpty()) continue;

            CourseOffering co = list.get(0).getAssignment().getCourseOffering();
            BigDecimal totalEarned = BigDecimal.ZERO;
            BigDecimal totalMax = BigDecimal.ZERO;

            for (Grade g : list) {
                totalEarned = totalEarned.add(g.getMarksObtained());
                totalMax = totalMax.add(g.getAssignment().getMaxMarks());
            }

            BigDecimal pct = totalMax.compareTo(BigDecimal.ZERO) > 0
                    ? totalEarned.divide(totalMax, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            List<GradeDto> dtos = list.stream().map(this::mapGradeToDto).collect(Collectors.toList());

            summaries.add(new StudentGradebookSummaryDto(
                    co.getId(),
                    co.getSubject().getCode(),
                    co.getSubject().getName(),
                    co.getSubject().getCredits(),
                    totalEarned,
                    totalMax,
                    pct,
                    dtos
            ));
        }

        return summaries;
    }

    private SubmissionDto mapSubmissionToDto(Submission sub) {
        return new SubmissionDto(
                sub.getId(),
                sub.getAssignment().getId(),
                sub.getStudent().getId(),
                sub.getStudent().getUser().getFullName(),
                sub.getStudent().getStudentIdNumber(),
                sub.getContentText(),
                sub.getAttachmentUrl(),
                sub.getAttachmentFilename(),
                sub.getSubmittedAt(),
                sub.getIsLate(),
                sub.getVersionNumber()
        );
    }

    private GradeDto mapGradeToDto(Grade g) {
        return new GradeDto(
                g.getId(),
                g.getAssignment().getId(),
                g.getStudent().getId(),
                g.getStudent().getUser().getFullName(),
                g.getSubmission() != null ? g.getSubmission().getId() : null,
                g.getMarksObtained(),
                g.getAssignment().getMaxMarks(),
                g.getFeedback(),
                g.getIsPublished(),
                g.getGradedAt()
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
