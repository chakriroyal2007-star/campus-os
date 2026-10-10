package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AcademicService;
import com.campusos.service.AssignmentService;
import com.campusos.service.AttendanceService;
import com.campusos.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_TEACHER')")
@Tag(name = "Teacher Operations", description = "Endpoints for course dashboard, teaching rosters, assignments and grading")
public class TeacherController {

    private final AcademicService academicService;
    private final AttendanceService attendanceService;
    private final AssignmentService assignmentService;
    private final ResourceService resourceService;

    @GetMapping("/dashboard/{courseOfferingId}")
    @Operation(summary = "Get aggregate dashboard for teacher course offering")
    public ResponseEntity<TeacherCourseDashboardDto> getTeacherCourseDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseOfferingId) {

        CourseOfferingDto course = academicService.getCourseById(courseOfferingId);
        List<CourseRosterStudentDto> roster = attendanceService.getRosterForCourseOffering(principal.getId(), courseOfferingId);
        List<AssignmentDto> assignments = assignmentService.getCourseAssignmentsForTeacher(principal.getId(), courseOfferingId);
        List<ResourceDto> resources = resourceService.getCourseResources(courseOfferingId);

        TeacherCourseDashboardDto dashboard = new TeacherCourseDashboardDto(
                course,
                roster,
                assignments,
                Collections.emptyList(),
                resources,
                Collections.emptyList()
        );

        return ResponseEntity.ok(dashboard);
    }
}
