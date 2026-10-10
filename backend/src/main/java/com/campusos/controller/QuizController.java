package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes & Assessments", description = "Endpoints for timed quiz attempts, scoring, and question banks")
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/student/my")
    @Operation(summary = "Get published quizzes for student's enrolled courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<QuizDto>> getStudentQuizzes(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(quizService.getStudentQuizzes(principal.getId()));
    }

    @GetMapping("/student/{quizId}")
    @Operation(summary = "Get quiz details and questions for attempt")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuizDto> getQuizDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getQuizDetailsForStudent(quizId, principal.getId()));
    }

    @PostMapping("/student/start/{quizId}")
    @Operation(summary = "Start a quiz attempt")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuizAttemptDto> startAttempt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.startQuizAttempt(principal.getId(), quizId));
    }

    @PostMapping("/student/submit")
    @Operation(summary = "Submit answers for server-side evaluation")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuizAttemptDto> submitQuiz(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitQuizRequest req) {
        return ResponseEntity.ok(quizService.submitQuizAttempt(principal.getId(), req));
    }

    @PostMapping("/teacher/create")
    @Operation(summary = "Create and publish a new quiz with question bank")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<QuizDto> createQuiz(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateQuizRequest req) {
        return ResponseEntity.ok(quizService.createQuiz(principal.getId(), req));
    }

    @GetMapping("/teacher/course/{courseOfferingId}")
    @Operation(summary = "Get quizzes for a course offering created by or assigned to teacher")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<QuizDto>> getCourseQuizzes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseOfferingId) {
        return ResponseEntity.ok(quizService.getCourseQuizzesForTeacher(principal.getId(), courseOfferingId));
    }
}
