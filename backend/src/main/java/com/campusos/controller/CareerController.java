package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.CareerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/career")
@RequiredArgsConstructor
@Tag(name = "Career Opportunities & Projects", description = "Endpoints for tech events, hackathons, internships and student project portfolios")
public class CareerController {

    private final CareerService careerService;

    @GetMapping("/opportunities")
    @Operation(summary = "Get verified tech opportunities and events")
    public ResponseEntity<List<OpportunityDto>> getOpportunities(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(careerService.getOpportunities(principal.getId()));
    }

    @PostMapping("/opportunities")
    @Operation(summary = "Publish an opportunity")
    public ResponseEntity<OpportunityDto> createOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOpportunityRequest req) {
        return ResponseEntity.ok(careerService.createOpportunity(principal.getId(), req));
    }

    @PostMapping("/opportunities/{opportunityId}/save")
    @Operation(summary = "Toggle bookmark on an opportunity")
    public ResponseEntity<Void> toggleSave(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID opportunityId) {
        careerService.toggleSaveOpportunity(principal.getId(), opportunityId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/projects")
    @Operation(summary = "Get showcase of student projects")
    public ResponseEntity<List<ProjectDto>> getProjects(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(careerService.getProjects(principal.getId()));
    }

    @PostMapping("/projects")
    @Operation(summary = "Publish a student project to portfolio")
    public ResponseEntity<ProjectDto> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProjectRequest req) {
        return ResponseEntity.ok(careerService.createProject(principal.getId(), req));
    }
}
