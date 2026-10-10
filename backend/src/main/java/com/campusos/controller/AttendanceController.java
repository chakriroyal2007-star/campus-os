package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AttendanceService;
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
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management", description = "Endpoints for attendance records, forecasts, roster marking and audit corrections")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/student/overview")
    @Operation(summary = "Get overall attendance overview and subject-wise percentages for student")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<OverallAttendanceSummaryDto> getStudentAttendanceOverview(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attendanceService.getStudentOverallAttendance(principal.getId()));
    }

    @GetMapping("/student/history/{courseOfferingId}")
    @Operation(summary = "Get detailed session-by-session attendance history for a subject")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<AttendanceRecordDto>> getStudentAttendanceHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseOfferingId) {
        return ResponseEntity.ok(attendanceService.getStudentSubjectAttendanceHistory(principal.getId(), courseOfferingId));
    }

    @GetMapping("/teacher/roster/{courseOfferingId}")
    @Operation(summary = "Get student roster for course offering to take attendance")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<List<CourseRosterStudentDto>> getRosterForAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID courseOfferingId) {
        return ResponseEntity.ok(attendanceService.getRosterForCourseOffering(principal.getId(), courseOfferingId));
    }

    @PostMapping("/teacher/record")
    @Operation(summary = "Save session attendance records atomically for a course offering")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<AttendanceSessionDto> recordAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceSaveRequest req) {
        return ResponseEntity.ok(attendanceService.recordAttendance(principal.getId(), req));
    }

    @PostMapping("/teacher/correct")
    @Operation(summary = "Auditable correction of an individual student attendance record with reason")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<AttendanceRecordDto> correctAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceCorrectionRequest req) {
        return ResponseEntity.ok(attendanceService.correctAttendanceRecord(principal.getId(), req));
    }
}
