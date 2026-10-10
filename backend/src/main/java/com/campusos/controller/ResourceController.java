package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.ResourceService;
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
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources & Study Materials", description = "Endpoints for lecture notes, slides, lab manuals, and syllabus files")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/student/my")
    @Operation(summary = "Get published resources for student's enrolled courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<ResourceDto>> getStudentResources(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resourceService.getStudentResources(principal.getId()));
    }

    @GetMapping("/course/{courseOfferingId}")
    @Operation(summary = "Get all resources for a specific course")
    public ResponseEntity<List<ResourceDto>> getCourseResources(@PathVariable UUID courseOfferingId) {
        return ResponseEntity.ok(resourceService.getCourseResources(courseOfferingId));
    }

    @PostMapping("/upload")
    @Operation(summary = "Save metadata and publish a course resource")
    public ResponseEntity<ResourceDto> createResource(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateResourceRequest req) {
        return ResponseEntity.ok(resourceService.createResource(principal.getId(), req));
    }
}
