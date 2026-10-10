package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.CourseOfferingDto;
import com.campusos.service.AcademicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic")
@RequiredArgsConstructor
@Tag(name = "Academic Structure & Courses", description = "Endpoints for course offerings, enrollments, and academic structure")
public class AcademicController {

    private final AcademicService academicService;

    @GetMapping("/courses/my")
    @Operation(summary = "Get enrolled courses for the current student")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<CourseOfferingDto>> getMyStudentCourses(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(academicService.getStudentCourses(principal.getId()));
    }

    @GetMapping("/courses/teaching")
    @Operation(summary = "Get assigned course offerings for the current teacher")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<CourseOfferingDto>> getMyTeachingCourses(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(academicService.getTeacherCourses(principal.getId()));
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "Get course offering details by ID")
    public ResponseEntity<CourseOfferingDto> getCourseById(@PathVariable UUID id) {
        return ResponseEntity.ok(academicService.getCourseById(id));
    }
}
