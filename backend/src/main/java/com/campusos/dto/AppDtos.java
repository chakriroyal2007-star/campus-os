package com.campusos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class AppDtos {

    // --- AUTH DTOS ---
    public record RegisterRequest(
            @NotBlank String institutionCode,
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String phoneNumber,
            @NotBlank String role, // ROLE_STUDENT, ROLE_TEACHER
            String studentIdNumber, // for student
            Integer batchYear, // for student
            Integer currentSemester, // for student
            String section, // for student
            String facultyIdNumber, // for teacher
            String designation, // for teacher
            UUID departmentId,
            UUID programId
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            String institutionCode
    ) {}

    @Builder
    public record AuthResponse(
            String token,
            UUID userId,
            UUID institutionId,
            String institutionName,
            String email,
            String firstName,
            String lastName,
            List<String> roles,
            UUID studentProfileId,
            UUID teacherProfileId,
            String studentIdNumber,
            String facultyIdNumber,
            String departmentName,
            String programName,
            Integer currentSemester,
            String section
    ) {}

    public record UserProfileDto(
            UUID id,
            UUID institutionId,
            String email,
            String firstName,
            String lastName,
            String fullName,
            String phoneNumber,
            List<String> roles,
            StudentSummaryDto studentProfile,
            TeacherSummaryDto teacherProfile
    ) {}

    public record StudentSummaryDto(
            UUID id,
            String studentIdNumber,
            Integer batchYear,
            Integer currentSemester,
            String section,
            String enrollmentStatus,
            String departmentName,
            String programName
    ) {}

    public record TeacherSummaryDto(
            UUID id,
            String facultyIdNumber,
            String designation,
            String employmentStatus,
            String departmentName
    ) {}

    // --- ACADEMIC DTOS ---
    public record CourseOfferingDto(
            UUID id,
            UUID subjectId,
            String subjectCode,
            String subjectName,
            Integer credits,
            String description,
            UUID academicTermId,
            String academicTermName,
            String section,
            String primaryTeacherName,
            UUID primaryTeacherId
    ) {}

    // --- TIMETABLE DTOS ---
    public record ClassSessionDto(
            UUID id,
            UUID courseOfferingId,
            String subjectCode,
            String subjectName,
            String section,
            Integer dayOfWeek, // 1=Mon..7=Sun
            LocalTime startTime,
            LocalTime endTime,
            String roomNumber,
            String building,
            String teacherName,
            boolean isCancelled,
            String cancellationReason
    ) {}

    public record TimetableSummaryDto(
            List<ClassSessionDto> sessions,
            ClassSessionDto currentSession,
            Long secondsRemainingInCurrentSession,
            ClassSessionDto nextSession,
            Long secondsUntilNextSession
    ) {}

    // --- ATTENDANCE DTOS ---
    public record AttendanceRecordDto(
            UUID recordId,
            UUID studentId,
            String studentName,
            String studentIdNumber,
            String section,
            String status, // PRESENT, ABSENT, LATE, EXCUSED
            String remarks
    ) {}

    public record AttendanceSessionDto(
            UUID id,
            UUID courseOfferingId,
            String subjectName,
            LocalDate sessionDate,
            boolean isLocked,
            List<AttendanceRecordDto> records
    ) {}

    public record AttendanceSaveRequest(
            @NotNull UUID courseOfferingId,
            @NotNull LocalDate sessionDate,
            UUID classSessionId,
            @NotNull List<AttendanceRecordInput> records
    ) {}

    public record AttendanceRecordInput(
            @NotNull UUID studentId,
            @NotBlank String status,
            String remarks
    ) {}

    public record AttendanceCorrectionRequest(
            @NotNull UUID recordId,
            @NotBlank String newStatus,
            @NotBlank String reason
    ) {}

    public record SubjectAttendanceSummaryDto(
            UUID courseOfferingId,
            String subjectCode,
            String subjectName,
            int totalConducted,
            int totalAttended,
            int totalAbsent,
            int totalLate,
            int totalExcused,
            BigDecimal currentPercentage,
            BigDecimal minimumRequiredPercentage,
            boolean isEligible,
            int classesNeededForTarget,
            int maxAbsencesAllowedBeforeShortage
    ) {}

    public record OverallAttendanceSummaryDto(
            int totalConductedAcrossAll,
            int totalAttendedAcrossAll,
            BigDecimal overallPercentage,
            BigDecimal minimumRequiredPercentage,
            List<SubjectAttendanceSummaryDto> subjects
    ) {}

    // --- ASSIGNMENTS & MARKS DTOS ---
    public record AssignmentDto(
            UUID id,
            UUID courseOfferingId,
            String subjectName,
            String subjectCode,
            String title,
            String description,
            String instructions,
            String rubricJson,
            BigDecimal maxMarks,
            BigDecimal weightagePercent,
            Instant dueDate,
            boolean isPublished,
            boolean allowLateSubmissions,
            Instant createdAt,
            SubmissionDto mySubmission,
            GradeDto myGrade,
            int totalSubmissionsCount
    ) {}

    public record CreateAssignmentRequest(
            @NotNull UUID courseOfferingId,
            @NotBlank String title,
            String description,
            String instructions,
            String rubricJson,
            @NotNull BigDecimal maxMarks,
            BigDecimal weightagePercent,
            @NotNull Instant dueDate,
            boolean allowLateSubmissions,
            boolean isPublished
    ) {}

    public record SubmissionDto(
            UUID id,
            UUID assignmentId,
            UUID studentId,
            String studentName,
            String studentIdNumber,
            String contentText,
            String attachmentUrl,
            String attachmentFilename,
            Instant submittedAt,
            boolean isLate,
            int versionNumber
    ) {}

    public record SubmitAssignmentRequest(
            @NotNull UUID assignmentId,
            String contentText,
            String attachmentUrl,
            String attachmentFilename,
            String idempotencyKey
    ) {}

    public record GradeDto(
            UUID id,
            UUID assignmentId,
            UUID studentId,
            String studentName,
            UUID submissionId,
            BigDecimal marksObtained,
            BigDecimal maxMarks,
            String feedback,
            boolean isPublished,
            Instant gradedAt
    ) {}

    public record GradeSubmissionRequest(
            @NotNull UUID assignmentId,
            @NotNull UUID studentId,
            UUID submissionId,
            @NotNull BigDecimal marksObtained,
            String feedback,
            boolean isPublished
    ) {}

    public record StudentGradebookSummaryDto(
            UUID courseOfferingId,
            String subjectCode,
            String subjectName,
            Integer credits,
            BigDecimal totalMarksEarned,
            BigDecimal totalMaxMarks,
            BigDecimal percentage,
            List<GradeDto> publishedGrades
    ) {}

    // --- QUIZ DTOS ---
    public record QuizDto(
            UUID id,
            UUID courseOfferingId,
            String subjectName,
            String title,
            String description,
            int durationMinutes,
            BigDecimal totalMarks,
            Instant startTime,
            Instant endTime,
            boolean isPublished,
            List<QuestionDto> questions,
            QuizAttemptDto myAttempt
    ) {}

    public record QuestionDto(
            UUID id,
            String questionText,
            String questionType,
            String optionsJson,
            BigDecimal marks,
            Integer orderIndex,
            String explanation // hidden for students during attempt
    ) {}

    public record CreateQuizRequest(
            @NotNull UUID courseOfferingId,
            @NotBlank String title,
            String description,
            int durationMinutes,
            BigDecimal totalMarks,
            Instant startTime,
            Instant endTime,
            boolean isPublished,
            List<CreateQuestionRequest> questions
    ) {}

    public record CreateQuestionRequest(
            @NotBlank String questionText,
            String questionType,
            String optionsJson,
            @NotBlank String correctAnswer,
            String explanation,
            BigDecimal marks,
            Integer orderIndex
    ) {}

    public record QuizAttemptDto(
            UUID id,
            UUID quizId,
            UUID studentId,
            Instant startedAt,
            Instant submittedAt,
            BigDecimal score,
            boolean isCompleted,
            List<QuizResponseDto> responses
    ) {}

    public record QuizResponseDto(
            UUID questionId,
            String selectedAnswer,
            Boolean isCorrect,
            BigDecimal awardedMarks
    ) {}

    public record SubmitQuizRequest(
            @NotNull UUID quizId,
            @NotNull List<QuizAnswerInput> answers
    ) {}

    public record QuizAnswerInput(
            @NotNull UUID questionId,
            String selectedAnswer
    ) {}

    // --- RESOURCE DTOS ---
    public record ResourceDto(
            UUID id,
            UUID courseOfferingId,
            String subjectName,
            String title,
            String description,
            String category,
            String fileKey,
            String fileName,
            Long fileSizeBytes,
            String mimeType,
            boolean isPublished,
            String uploaderName,
            Instant createdAt
    ) {}

    public record CreateResourceRequest(
            UUID courseOfferingId,
            @NotBlank String title,
            String description,
            @NotBlank String category,
            @NotBlank String fileKey,
            @NotBlank String fileName,
            Long fileSizeBytes,
            @NotBlank String mimeType,
            boolean isPublished
    ) {}

    // --- PLANNER DTOS ---
    public record TaskDto(
            UUID id,
            String title,
            String description,
            Instant dueDate,
            String priority, // LOW, MEDIUM, HIGH, URGENT
            String status, // PENDING, IN_PROGRESS, COMPLETED
            UUID linkedAssignmentId,
            String linkedAssignmentTitle,
            UUID linkedQuizId,
            String linkedQuizTitle,
            Instant createdAt
    ) {}

    public record CreateTaskRequest(
            @NotBlank String title,
            String description,
            Instant dueDate,
            String priority,
            UUID linkedAssignmentId,
            UUID linkedQuizId
    ) {}

    public record UpdateTaskRequest(
            String title,
            String description,
            Instant dueDate,
            String priority,
            String status
    ) {}

    // --- NOTIFICATION DTOS ---
    public record NotificationDto(
            UUID id,
            String title,
            String message,
            String type,
            String referenceId,
            boolean isRead,
            Instant createdAt
    ) {}

    // --- COMMUNITY & MESSAGING DTOS ---
    public record FriendshipDto(
            UUID id,
            UUID friendUserId,
            String friendName,
            String friendEmail,
            String friendRole,
            String status,
            Instant createdAt
    ) {}

    public record ConversationDto(
            UUID id,
            String title,
            boolean isGroup,
            UUID courseOfferingId,
            String courseName,
            List<String> memberNames,
            MessageDto lastMessage,
            Instant createdAt
    ) {}

    public record MessageDto(
            UUID id,
            UUID conversationId,
            UUID senderId,
            String senderName,
            String content,
            Instant createdAt
    ) {}

    public record SendMessageRequest(
            @NotNull UUID conversationId,
            @NotBlank String content
    ) {}

    public record CreateConversationRequest(
            String title,
            boolean isGroup,
            UUID courseOfferingId,
            List<UUID> memberUserIds,
            String initialMessage
    ) {}

    // --- AI ASSISTANT DTOS ---
    public record AiConversationDto(
            UUID id,
            String title,
            String modelName,
            List<AiMessageDto> messages,
            Instant createdAt
    ) {}

    public record AiMessageDto(
            UUID id,
            String role,
            String content,
            String sourcesJson,
            Instant createdAt
    ) {}

    public record AiPromptRequest(
            UUID conversationId,
            @NotBlank String prompt,
            UUID courseOfferingId,
            String taskType // EXPLAIN, PRACTICE_QUESTIONS, REVISION_PLAN, LESSON_OUTLINE, RUBRIC_GEN
    ) {}

    public record AiResponseDto(
            UUID conversationId,
            String reply,
            String modelUsed,
            List<String> sources
    ) {}

    // --- CAREER & PROJECTS DTOS ---
    public record OpportunityDto(
            UUID id,
            String title,
            String companyOrOrganizer,
            String type,
            String location,
            LocalDate deadline,
            String description,
            String applyUrl,
            boolean verified,
            boolean isSaved,
            Instant createdAt
    ) {}

    public record CreateOpportunityRequest(
            @NotBlank String title,
            @NotBlank String companyOrOrganizer,
            @NotBlank String type,
            String location,
            LocalDate deadline,
            String description,
            @NotBlank String applyUrl
    ) {}

    public record ProjectDto(
            UUID id,
            String title,
            String description,
            String skillsTags,
            String githubUrl,
            String demoUrl,
            String creatorName,
            UUID creatorId,
            List<ProjectMemberDto> members,
            Instant createdAt
    ) {}

    public record ProjectMemberDto(
            UUID userId,
            String userName,
            String role,
            Instant joinedAt
    ) {}

    public record CreateProjectRequest(
            @NotBlank String title,
            String description,
            String skillsTags,
            String githubUrl,
            String demoUrl
    ) {}

    // --- TEACHER ROSTER DTO ---
    public record CourseRosterStudentDto(
            UUID studentId,
            UUID userId,
            String studentName,
            String studentIdNumber,
            String email,
            String section,
            BigDecimal currentAttendancePercentage,
            BigDecimal currentGradePercentage
    ) {}

    public record TeacherCourseDashboardDto(
            CourseOfferingDto course,
            List<CourseRosterStudentDto> roster,
            List<AssignmentDto> assignments,
            List<QuizDto> quizzes,
            List<ResourceDto> resources,
            List<AttendanceSessionDto> recentAttendanceSessions
    ) {}

    // --- COLLEGE ADMIN DTOS ---
    public record BootstrapAdminRequest(
            @NotBlank String institutionCode,
            @NotBlank String institutionName,
            @NotBlank @Email String adminEmail,
            @NotBlank String adminPassword,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String timezone
    ) {}

    public record AdminDashboardSummaryDto(
            UUID institutionId,
            String institutionName,
            String institutionCode,
            long totalStudents,
            long totalTeachers,
            long totalDepartments,
            long totalPrograms,
            long totalSubjects,
            long totalCourseOfferings,
            long totalActiveTerms,
            long totalClassSessions
    ) {}

    public record InstitutionDetailDto(
            UUID id,
            String code,
            String name,
            String domain,
            String timezone,
            Instant createdAt,
            BigDecimal minimumAttendanceThreshold
    ) {}

    public record UpdateInstitutionRequest(
            @NotBlank String name,
            String domain,
            String timezone,
            BigDecimal minimumAttendanceThreshold
    ) {}

    public record DepartmentDto(
            UUID id,
            String code,
            String name,
            long programCount,
            long subjectCount,
            Instant createdAt
    ) {}

    public record CreateDepartmentRequest(
            @NotBlank String code,
            @NotBlank String name
    ) {}

    public record ProgramDto(
            UUID id,
            UUID departmentId,
            String departmentName,
            String code,
            String name,
            String degreeType,
            int durationYears,
            Instant createdAt
    ) {}

    public record CreateProgramRequest(
            @NotNull UUID departmentId,
            @NotBlank String code,
            @NotBlank String name,
            @NotBlank String degreeType, // UNDERGRADUATE, POSTGRADUATE
            int durationYears
    ) {}

    public record AcademicTermDto(
            UUID id,
            String name,
            String academicYear,
            LocalDate startDate,
            LocalDate endDate,
            boolean isCurrent,
            Instant createdAt
    ) {}

    public record CreateAcademicTermRequest(
            @NotBlank String name,
            @NotBlank String academicYear,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            boolean isCurrent
    ) {}

    public record SubjectDto(
            UUID id,
            UUID departmentId,
            String departmentName,
            String code,
            String name,
            int credits,
            String description,
            Instant createdAt
    ) {}

    public record CreateSubjectRequest(
            @NotNull UUID departmentId,
            @NotBlank String code,
            @NotBlank String name,
            int credits,
            String description
    ) {}

    public record CourseOfferingDetailDto(
            UUID id,
            UUID subjectId,
            String subjectCode,
            String subjectName,
            int credits,
            UUID academicTermId,
            String academicTermName,
            String section,
            UUID assignedTeacherId,
            String assignedTeacherName,
            long enrolledStudentCount,
            Instant createdAt
    ) {}

    public record CreateCourseOfferingRequest(
            @NotNull UUID subjectId,
            @NotNull UUID academicTermId,
            @NotBlank String section,
            UUID assignedTeacherProfileId
    ) {}

    public record AssignTeacherRequest(
            @NotNull UUID courseOfferingId,
            @NotNull UUID teacherProfileId
    ) {}

    public record StudentDetailDto(
            UUID studentProfileId,
            UUID userId,
            String studentIdNumber,
            String firstName,
            String lastName,
            String fullName,
            String email,
            String phoneNumber,
            int batchYear,
            int currentSemester,
            String section,
            String enrollmentStatus,
            UUID departmentId,
            String departmentName,
            UUID programId,
            String programName,
            boolean isActive,
            List<String> enrolledCourses
    ) {}

    public record CreateStudentRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String phoneNumber,
            @NotBlank String studentIdNumber,
            int batchYear,
            int currentSemester,
            @NotBlank String section,
            UUID departmentId,
            UUID programId
    ) {}

    public record BulkStudentImportRequest(
            @NotBlank String csvContent,
            UUID departmentId,
            UUID programId,
            Integer batchYear,
            Integer currentSemester,
            String defaultSection
    ) {}

    public record StudentRowImportError(
            int rowNumber,
            String studentIdNumber,
            String email,
            String errorMessage
    ) {}

    public record BulkImportResultDto(
            int totalProcessed,
            int successCount,
            int failureCount,
            List<StudentDetailDto> importedStudents,
            List<StudentRowImportError> errors
    ) {}

    public record TeacherDetailDto(
            UUID teacherProfileId,
            UUID userId,
            String facultyIdNumber,
            String firstName,
            String lastName,
            String fullName,
            String email,
            String phoneNumber,
            String designation,
            String employmentStatus,
            UUID departmentId,
            String departmentName,
            boolean isActive,
            List<String> assignedCourses
    ) {}

    public record CreateTeacherRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String phoneNumber,
            @NotBlank String facultyIdNumber,
            String designation,
            UUID departmentId
    ) {}

    public record EnrollStudentRequest(
            @NotNull UUID courseOfferingId,
            @NotNull UUID studentProfileId
    ) {}

    public record CreateClassSessionScheduleRequest(
            @NotNull UUID courseOfferingId,
            UUID roomId,
            int dayOfWeek, // 1=Monday ... 7=Sunday
            @NotNull LocalTime startTime,
            @NotNull LocalTime endTime,
            String recurrenceType,
            String sessionTitle
    ) {}

    public record AllocateStudentSectionRequest(
            @NotBlank String section,
            Integer currentSemester,
            UUID departmentId,
            UUID programId
    ) {}

    public record AutoEnrollSectionRequest(
            @NotBlank String section,
            UUID academicTermId
    ) {}

    public record AutoEnrollSectionResultDto(
            String section,
            int studentsProcessed,
            int enrollmentsCreated,
            List<String> enrolledOfferings
    ) {}
}
