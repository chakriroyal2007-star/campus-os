package com.campusos.controller;

import com.campusos.config.UserPrincipal;
import com.campusos.dto.AppDtos.*;
import com.campusos.service.AuthService;
import com.campusos.service.CollegeAdminService;
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
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "College Administration", description = "Endpoints for college onboarding, department setup, course offerings, rosters, and teaching assignments")
public class CollegeAdminController {

    private final CollegeAdminService collegeAdminService;
    private final AuthService authService;

    @PostMapping("/bootstrap")
    @Operation(summary = "Bootstrap initial College Administrator for an institution")
    public ResponseEntity<AuthResponse> bootstrapAdmin(@Valid @RequestBody BootstrapAdminRequest req) {
        return ResponseEntity.ok(authService.bootstrapCollegeAdmin(req));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get College Administrator dashboard summary metrics")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AdminDashboardSummaryDto> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(collegeAdminService.getDashboardSummary(principal.getId()));
    }

    @GetMapping("/institution")
    @Operation(summary = "Get institution details and attendance policies")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<InstitutionDetailDto> getInstitution(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(collegeAdminService.getInstitution(principal.getId()));
    }

    @PutMapping("/institution")
    @Operation(summary = "Update institution profile and policy defaults")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<InstitutionDetailDto> updateInstitution(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateInstitutionRequest req) {
        return ResponseEntity.ok(collegeAdminService.updateInstitution(principal.getId(), req));
    }

    @GetMapping("/departments")
    @Operation(summary = "List all departments in the institution")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<DepartmentDto>> getDepartments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(collegeAdminService.getDepartments(principal.getId()));
    }

    @PostMapping("/departments")
    @Operation(summary = "Create a new department")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<DepartmentDto> createDepartment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDepartmentRequest req) {
        return ResponseEntity.ok(collegeAdminService.createDepartment(principal.getId(), req));
    }

    @GetMapping("/programs")
    @Operation(summary = "List all degree programs in the institution")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<ProgramDto>> getPrograms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID departmentId) {
        return ResponseEntity.ok(collegeAdminService.getPrograms(principal.getId(), departmentId));
    }

    @PostMapping("/programs")
    @Operation(summary = "Create a new degree program")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<ProgramDto> createProgram(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProgramRequest req) {
        return ResponseEntity.ok(collegeAdminService.createProgram(principal.getId(), req));
    }

    @GetMapping("/terms")
    @Operation(summary = "List all academic terms and semesters")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<AcademicTermDto>> getAcademicTerms(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(collegeAdminService.getAcademicTerms(principal.getId()));
    }

    @PostMapping("/terms")
    @Operation(summary = "Create a new academic term/semester")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AcademicTermDto> createAcademicTerm(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAcademicTermRequest req) {
        return ResponseEntity.ok(collegeAdminService.createAcademicTerm(principal.getId(), req));
    }

    @GetMapping("/subjects")
    @Operation(summary = "List all catalog subjects")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<SubjectDto>> getSubjects(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID departmentId) {
        return ResponseEntity.ok(collegeAdminService.getSubjects(principal.getId(), departmentId));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create a new subject in the catalog")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<SubjectDto> createSubject(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSubjectRequest req) {
        return ResponseEntity.ok(collegeAdminService.createSubject(principal.getId(), req));
    }

    @GetMapping("/courses")
    @Operation(summary = "List all course offerings with assigned teachers and enrollment counts")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<CourseOfferingDetailDto>> getCourseOfferings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID termId) {
        return ResponseEntity.ok(collegeAdminService.getCourseOfferings(principal.getId(), termId));
    }

    @PostMapping("/courses")
    @Operation(summary = "Create a new course offering for a term and section")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<CourseOfferingDetailDto> createCourseOffering(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCourseOfferingRequest req) {
        return ResponseEntity.ok(collegeAdminService.createCourseOffering(principal.getId(), req));
    }

    @PostMapping("/courses/assign-teacher")
    @Operation(summary = "Assign or reassign a teacher to a course offering")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<CourseOfferingDetailDto> assignTeacher(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AssignTeacherRequest req) {
        return ResponseEntity.ok(collegeAdminService.assignTeacher(principal.getId(), req));
    }

    @GetMapping("/students")
    @Operation(summary = "List enrolled students with filters")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<StudentDetailDto>> getStudents(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer batchYear,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(collegeAdminService.getStudents(principal.getId(), batchYear, section));
    }

    @PostMapping("/students")
    @Operation(summary = "Create a single student record")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<StudentDetailDto> createStudent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateStudentRequest req) {
        return ResponseEntity.ok(collegeAdminService.createStudent(principal.getId(), req));
    }

    @PostMapping("/students/bulk-import")
    @Operation(summary = "Bulk import students from CSV content")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<BulkImportResultDto> bulkImportStudents(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulkStudentImportRequest req) {
        return ResponseEntity.ok(collegeAdminService.bulkImportStudents(principal.getId(), req));
    }

    @GetMapping("/teachers")
    @Operation(summary = "List faculty teachers")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<TeacherDetailDto>> getTeachers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(collegeAdminService.getTeachers(principal.getId()));
    }

    @PostMapping("/teachers")
    @Operation(summary = "Create/invite a teacher record")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<TeacherDetailDto> createTeacher(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTeacherRequest req) {
        return ResponseEntity.ok(collegeAdminService.createTeacher(principal.getId(), req));
    }

    @PostMapping("/enroll")
    @Operation(summary = "Enroll student into a specific course offering")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> enrollStudent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EnrollStudentRequest req) {
        collegeAdminService.enrollStudent(principal.getId(), req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/timetable/schedule")
    @Operation(summary = "Schedule a weekly lecture session for a course offering")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<ClassSessionDto> scheduleClassSession(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateClassSessionScheduleRequest req) {
        return ResponseEntity.ok(collegeAdminService.scheduleClassSession(principal.getId(), req));
    }

    @PostMapping("/students/{studentProfileId}/allocate-section")
    @Operation(summary = "Allocate or reassign student to a section and sync course enrollments")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<StudentDetailDto> allocateStudentSection(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID studentProfileId,
            @Valid @RequestBody AllocateStudentSectionRequest req) {
        return ResponseEntity.ok(collegeAdminService.allocateStudentSection(principal.getId(), studentProfileId, req));
    }

    @PostMapping("/sections/auto-enroll")
    @Operation(summary = "Auto-enroll all eligible students in a section to its active course offerings")
    @PreAuthorize("hasAnyRole('ROLE_COLLEGE_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AutoEnrollSectionResultDto> autoEnrollSection(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AutoEnrollSectionRequest req) {
        return ResponseEntity.ok(collegeAdminService.autoEnrollSection(principal.getId(), req));
    }
}
