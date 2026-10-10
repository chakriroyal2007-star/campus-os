package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AssignmentService;
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
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments & Gradebook", description = "Endpoints for assignment creation, submissions, grading and gradebook")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/student/my")
    @Operation(summary = "Get all published assignments for the student with submission and grade status")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<AssignmentDto>> getStudentAssignments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assignmentService.getStudentAssignments(principal.getId()));
    }

    @GetMapping("/student/gradebook")
    @Operation(summary = "Get student gradebook and marks summary across all subjects")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<StudentGradebookSummaryDto>> getStudentGradebook(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assignmentService.getStudentGradebook(principal.getId()));
    }

    @PostMapping("/student/submit")
    @Operation(summary = "Submit response/files for an assignment")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<SubmissionDto> submitAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitAssignmentRequest req) {
        return ResponseEntity.ok(assignmentService.submitAssignment(principal.getId(), req));
    }

    @GetMapping("/teacher/course/{courseOfferingId}")
    @Operation(summary = "Get assignments for a course offering created by teacher")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<AssignmentDto>> getCourseAssignments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseOfferingId) {
        return ResponseEntity.ok(assignmentService.getCourseAssignmentsForTeacher(principal.getId(), courseOfferingId));
    }

    @PostMapping("/teacher/create")
    @Operation(summary = "Create a new assignment with rubric and deadlines")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<AssignmentDto> createAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAssignmentRequest req) {
        return ResponseEntity.ok(assignmentService.createAssignment(principal.getId(), req));
    }

    @GetMapping("/teacher/submissions/{assignmentId}")
    @Operation(summary = "Get student submissions for an assignment")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<SubmissionDto>> getSubmissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentSubmissions(principal.getId(), assignmentId));
    }

    @PostMapping("/teacher/grade")
    @Operation(summary = "Grade a student submission with marks and feedback")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<GradeDto> gradeSubmission(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GradeSubmissionRequest req) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(principal.getId(), req));
    }
}
