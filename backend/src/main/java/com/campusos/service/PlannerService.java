package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlannerService {

    private final TaskRepository taskRepository;
    private final UserAccountRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public List<TaskDto> getUserTasks(UUID userId) {
        List<Task> tasks = taskRepository.findByUserIdOrderByDueDateAsc(userId);
        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TaskDto createTask(UUID userId, CreateTaskRequest req) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Assignment assignment = req.linkedAssignmentId() != null
                ? assignmentRepository.findById(req.linkedAssignmentId()).orElse(null)
                : null;

        Quiz quiz = req.linkedQuizId() != null
                ? quizRepository.findById(req.linkedQuizId()).orElse(null)
                : null;

        Task task = Task.builder()
                .user(user)
                .title(req.title())
                .description(req.description())
                .dueDate(req.dueDate())
                .priority(req.priority() != null ? req.priority() : "MEDIUM")
                .status("PENDING")
                .linkedAssignment(assignment)
                .linkedQuiz(quiz)
                .build();

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTask(UUID userId, UUID taskId, UpdateTaskRequest req) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (!task.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }

        if (req.title() != null) task.setTitle(req.title());
        if (req.description() != null) task.setDescription(req.description());
        if (req.dueDate() != null) task.setDueDate(req.dueDate());
        if (req.priority() != null) task.setPriority(req.priority());
        if (req.status() != null) task.setStatus(req.status());

        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public void deleteTask(UUID userId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        if (task.getUser().getId().equals(userId)) {
            taskRepository.delete(task);
        }
    }

    private TaskDto mapToDto(Task t) {
        return new TaskDto(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getDueDate(),
                t.getPriority(),
                t.getStatus(),
                t.getLinkedAssignment() != null ? t.getLinkedAssignment().getId() : null,
                t.getLinkedAssignment() != null ? t.getLinkedAssignment().getTitle() : null,
                t.getLinkedQuiz() != null ? t.getLinkedQuiz().getId() : null,
                t.getLinkedQuiz() != null ? t.getLinkedQuiz().getTitle() : null,
                t.getCreatedAt()
        );
    }
}
