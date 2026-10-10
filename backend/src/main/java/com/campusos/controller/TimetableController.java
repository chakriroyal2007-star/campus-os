package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.TimetableSummaryDto;
import com.campusos.service.TimetableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
@Tag(name = "Timetable & Schedules", description = "Endpoints for student and teacher schedules, live class countdowns and cancellations")
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/student")
    @Operation(summary = "Get timetable for student with countdown to current and next class")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<TimetableSummaryDto> getStudentTimetable(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timetableService.getStudentTimetable(principal.getId(), date));
    }

    @GetMapping("/teacher")
    @Operation(summary = "Get timetable for teacher with current session countdown")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<TimetableSummaryDto> getTeacherTimetable(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timetableService.getTeacherTimetable(principal.getId(), date));
    }
}
