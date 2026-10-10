package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.PlannerService;
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
@RequestMapping("/api/v1/planner")
@RequiredArgsConstructor
@Tag(name = "Personal Planner & Tasks", description = "Endpoints for personal tasks, deadlines, and study reminders")
public class PlannerController {

    private final PlannerService plannerService;

    @GetMapping("/tasks")
    @Operation(summary = "Get all tasks for the current user")
    public ResponseEntity<List<TaskDto>> getTasks(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(plannerService.getUserTasks(principal.getId()));
    }

    @PostMapping("/tasks")
    @Operation(summary = "Create a new planner task")
    public ResponseEntity<TaskDto> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTaskRequest req) {
        return ResponseEntity.ok(plannerService.createTask(principal.getId(), req));
    }

    @PatchMapping("/tasks/{taskId}")
    @Operation(summary = "Update task status, priority, or details")
    public ResponseEntity<TaskDto> updateTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID taskId,
            @RequestBody UpdateTaskRequest req) {
        return ResponseEntity.ok(plannerService.updateTask(principal.getId(), taskId, req));
    }

    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID taskId) {
        plannerService.deleteTask(principal.getId(), taskId);
        return ResponseEntity.noContent().build();
    }
}
