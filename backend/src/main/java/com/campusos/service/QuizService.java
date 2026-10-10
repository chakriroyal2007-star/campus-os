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
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizResponseRepository responseRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserAccountRepository userRepository;

    @Transactional(readOnly = true)
    public List<QuizDto> getStudentQuizzes(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        List<Quiz> quizzes = quizRepository.findPublishedForStudent(student.getId());

        return quizzes.stream().map(q -> {
            QuizAttempt attempt = attemptRepository.findByQuizIdAndStudentId(q.getId(), student.getId()).orElse(null);
            QuizAttemptDto attemptDto = attempt != null ? mapAttemptToDto(attempt) : null;
            return mapQuizToDto(q, false, attemptDto);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizDto getQuizDetailsForStudent(UUID quizId, UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentUserId));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        boolean enrolled = enrollmentRepository.findByCourseOfferingId(quiz.getCourseOffering().getId()).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in the course offering for this quiz.");
        }

        QuizAttempt attempt = attemptRepository.findByQuizIdAndStudentId(quiz.getId(), student.getId()).orElse(null);
        QuizAttemptDto attemptDto = attempt != null ? mapAttemptToDto(attempt) : null;

        // Hide explanations if attempt is not completed yet
        boolean revealSolutions = attempt != null && attempt.getIsCompleted();
        return mapQuizToDto(quiz, revealSolutions, attemptDto);
    }

    @Transactional
    public QuizDto createQuiz(UUID teacherUserId, CreateQuizRequest req) {
        UserAccount teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherUserId));

        CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));

        verifyTeacherOrAdminAccess(teacherUserId, co);

        Quiz quiz = Quiz.builder()
                .courseOffering(co)
                .createdBy(teacher)
                .title(req.title())
                .description(req.description())
                .durationMinutes(req.durationMinutes())
                .totalMarks(req.totalMarks())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .isPublished(req.isPublished())
                .build();

        quiz = quizRepository.save(quiz);

        if (req.questions() != null) {
            int order = 0;
            for (CreateQuestionRequest qReq : req.questions()) {
                Question question = Question.builder()
                        .quiz(quiz)
                        .questionText(qReq.questionText())
                        .questionType(qReq.questionType() != null ? qReq.questionType() : "MULTIPLE_CHOICE")
                        .optionsJson(qReq.optionsJson())
                        .correctAnswer(qReq.correctAnswer())
                        .explanation(qReq.explanation())
                        .marks(qReq.marks() != null ? qReq.marks() : BigDecimal.ONE)
                        .orderIndex(order++)
                        .build();
                questionRepository.save(question);
            }
        }

        return mapQuizToDto(quiz, true, null);
    }

    @Transactional
    public QuizAttemptDto startQuizAttempt(UUID studentUserId, UUID quizId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentUserId));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        boolean enrolled = enrollmentRepository.findByCourseOfferingId(quiz.getCourseOffering().getId()).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in the course offering for this quiz.");
        }

        if (!quiz.getIsPublished()) {
            throw new BadRequestException("This quiz is not currently open.");
        }

        Optional<QuizAttempt> existing = attemptRepository.findByQuizIdAndStudentId(quiz.getId(), student.getId());
        if (existing.isPresent()) {
            return mapAttemptToDto(existing.get());
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .startedAt(Instant.now())
                .isCompleted(false)
                .score(BigDecimal.ZERO)
                .build();

        attempt = attemptRepository.save(attempt);
        return mapAttemptToDto(attempt);
    }

    @Transactional
    public QuizAttemptDto submitQuizAttempt(UUID studentUserId, SubmitQuizRequest req) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentUserId));

        QuizAttempt attempt = attemptRepository.findByQuizIdAndStudentId(req.quizId(), student.getId())
                .orElseThrow(() -> new BadRequestException("No active attempt found for this quiz. Please start the quiz first."));

        boolean enrolled = enrollmentRepository.findByCourseOfferingId(attempt.getQuiz().getCourseOffering().getId()).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!enrolled) {
            throw new UnauthorizedException("You are not enrolled in the course offering for this quiz.");
        }

        if (attempt.getIsCompleted()) {
            return mapAttemptToDto(attempt); // already submitted, return idempotent result
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(req.quizId());
        Map<UUID, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        BigDecimal totalScore = BigDecimal.ZERO;
        List<QuizResponse> responses = new ArrayList<>();

        for (QuizAnswerInput ans : req.answers()) {
            Question q = questionMap.get(ans.questionId());
            if (q == null) continue;

            boolean isCorrect = q.getCorrectAnswer().trim().equalsIgnoreCase(ans.selectedAnswer().trim());
            BigDecimal marks = isCorrect ? q.getMarks() : BigDecimal.ZERO;
            if (isCorrect) {
                totalScore = totalScore.add(marks);
            }

            QuizResponse response = QuizResponse.builder()
                    .attempt(attempt)
                    .question(q)
                    .selectedAnswer(ans.selectedAnswer())
                    .isCorrect(isCorrect)
                    .awardedMarks(marks)
                    .build();
            responses.add(response);
        }

        responseRepository.saveAll(responses);

        attempt.setScore(totalScore);
        attempt.setSubmittedAt(Instant.now());
        attempt.setIsCompleted(true);
        attempt = attemptRepository.save(attempt);

        return mapAttemptToDto(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizDto> getCourseQuizzesForTeacher(UUID teacherUserId, UUID courseOfferingId) {
        CourseOffering co = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + courseOfferingId));
        verifyTeacherOrAdminAccess(teacherUserId, co);

        List<Quiz> quizzes = quizRepository.findByCourseOfferingId(courseOfferingId);
        return quizzes.stream().map(q -> mapQuizToDto(q, true, null)).collect(Collectors.toList());
    }

    private QuizDto mapQuizToDto(Quiz q, boolean revealSolutions, QuizAttemptDto attemptDto) {
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(q.getId());
        List<QuestionDto> qDtos = questions.stream().map(question -> new QuestionDto(
                question.getId(),
                question.getQuestionText(),
                question.getQuestionType(),
                question.getOptionsJson(),
                question.getMarks(),
                question.getOrderIndex(),
                revealSolutions ? question.getExplanation() : null
        )).collect(Collectors.toList());

        return new QuizDto(
                q.getId(),
                q.getCourseOffering().getId(),
                q.getCourseOffering().getSubject().getName(),
                q.getTitle(),
                q.getDescription(),
                q.getDurationMinutes(),
                q.getTotalMarks(),
                q.getStartTime(),
                q.getEndTime(),
                q.getIsPublished(),
                qDtos,
                attemptDto
        );
    }

    private QuizAttemptDto mapAttemptToDto(QuizAttempt a) {
        List<QuizResponse> responses = responseRepository.findByAttemptId(a.getId());
        List<QuizResponseDto> rDtos = responses.stream().map(r -> new QuizResponseDto(
                r.getQuestion().getId(),
                r.getSelectedAnswer(),
                r.getIsCorrect(),
                r.getAwardedMarks()
        )).collect(Collectors.toList());

        return new QuizAttemptDto(
                a.getId(),
                a.getQuiz().getId(),
                a.getStudent().getId(),
                a.getStartedAt(),
                a.getSubmittedAt(),
                a.getScore(),
                a.getIsCompleted(),
                rDtos
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
