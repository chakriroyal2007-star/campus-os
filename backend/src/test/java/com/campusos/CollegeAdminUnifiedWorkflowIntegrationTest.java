package com.campusos;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.UnauthorizedException;
import com.campusos.repository.*;
import com.campusos.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CollegeAdminUnifiedWorkflowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private CollegeAdminService collegeAdminService;

    @Autowired
    private AcademicService academicService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private CourseOfferingRepository courseOfferingRepository;

    @Test
    @DisplayName("Verify complete 20-step College Administrator setup and unified academic lifecycle")
    void testCompleteCollegeAdminUnifiedLifecycle() {
        long ts = System.currentTimeMillis();
        String instCode = "TECH_UNIV_" + ts;

        // 1. Provision College Admin
        AuthResponse adminAuth = authService.bootstrapCollegeAdmin(new BootstrapAdminRequest(
                instCode,
                "Apex Institute of Technology",
                "admin@" + instCode.toLowerCase() + ".edu",
                "AdminSecure2026!",
                "Dean",
                "Sharma",
                "Asia/Kolkata"
        ));
        assertNotNull(adminAuth);
        assertNotNull(adminAuth.token());
        assertTrue(adminAuth.roles().contains("ROLE_COLLEGE_ADMIN"));

        // 2. Admin logs in with authentic credentials
        AuthResponse loggedInAdmin = authService.login(new LoginRequest(
                "admin@" + instCode.toLowerCase() + ".edu",
                "AdminSecure2026!",
                instCode
        ));
        assertEquals(adminAuth.userId(), loggedInAdmin.userId());

        // 3. Admin configures Institution Attendance Policy
        InstitutionDetailDto instProfile = collegeAdminService.updateInstitution(adminAuth.userId(), new UpdateInstitutionRequest(
                "Apex Institute of Technology & Research",
                "apex.edu",
                "Asia/Kolkata",
                new BigDecimal("75.00")
        ));
        assertEquals("Apex Institute of Technology & Research", instProfile.name());
        assertEquals(new BigDecimal("75.00"), instProfile.minimumAttendanceThreshold());

        // 4. Admin creates Academic Term
        AcademicTermDto term = collegeAdminService.createAcademicTerm(adminAuth.userId(), new CreateAcademicTermRequest(
                "Fall 2026",
                "2026-2027",
                LocalDate.now(),
                LocalDate.now().plusMonths(5),
                true
        ));
        assertNotNull(term.id());
        assertTrue(term.isCurrent());

        // 5. Admin creates Department and Program
        DepartmentDto dept = collegeAdminService.createDepartment(adminAuth.userId(), new CreateDepartmentRequest(
                "CSE",
                "Computer Science and Engineering"
        ));
        assertNotNull(dept.id());

        ProgramDto prog = collegeAdminService.createProgram(adminAuth.userId(), new CreateProgramRequest(
                dept.id(),
                "BTECH_CSE",
                "Bachelor of Technology in CSE",
                "UNDERGRADUATE",
                4
        ));
        assertNotNull(prog.id());

        // 6. Admin creates Subject Catalog Item
        SubjectDto subject = collegeAdminService.createSubject(adminAuth.userId(), new CreateSubjectRequest(
                dept.id(),
                "CS301",
                "Data Structures and Algorithms",
                4,
                "Core data structures, trees, graphs and algorithm analysis"
        ));
        assertNotNull(subject.id());

        // 7. Admin creates Course Offering for Fall 2026 Section A
        CourseOfferingDetailDto offeringA = collegeAdminService.createCourseOffering(adminAuth.userId(), new CreateCourseOfferingRequest(
                subject.id(),
                term.id(),
                "A",
                null
        ));
        assertNotNull(offeringA.id());
        assertEquals("A", offeringA.section());

        // 8. Admin creates/onboards Teacher
        TeacherDetailDto teacherDetail = collegeAdminService.createTeacher(adminAuth.userId(), new CreateTeacherRequest(
                "prof.vikram@" + instCode.toLowerCase() + ".edu",
                "TeacherPass123!",
                "Vikram",
                "Deshmukh",
                "+919876540001",
                "FAC-CS-001",
                "Associate Professor",
                dept.id()
        ));
        assertNotNull(teacherDetail.teacherProfileId());

        // 9. Admin assigns Teacher to Section A Course Offering
        CourseOfferingDetailDto assignedOffering = collegeAdminService.assignTeacher(adminAuth.userId(), new AssignTeacherRequest(
                offeringA.id(),
                teacherDetail.teacherProfileId()
        ));
        assertEquals(teacherDetail.teacherProfileId(), assignedOffering.assignedTeacherId());

        // 10. Admin creates and bulk imports Students into Section A
        StudentDetailDto student1 = collegeAdminService.createStudent(adminAuth.userId(), new CreateStudentRequest(
                "aarav@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                "Aarav",
                "Mehta",
                "+919876540002",
                "STU-2026-001",
                2026,
                3,
                "A",
                dept.id(),
                prog.id()
        ));

        // Bulk CSV Import for second student
        String csv = "STU-2026-002,Rohan,Verma,rohan@" + instCode.toLowerCase() + ".edu,StudentPass123!,A,2026,3\n";
        BulkImportResultDto bulkResult = collegeAdminService.bulkImportStudents(adminAuth.userId(), new BulkStudentImportRequest(
                csv, dept.id(), prog.id(), 2026, 3, "A"
        ));
        assertEquals(1, bulkResult.successCount());
        assertEquals(0, bulkResult.failureCount());
        StudentDetailDto student2 = bulkResult.importedStudents().get(0);

        // 11. Teacher logs in and accesses assigned courses & roster
        AuthResponse teacherAuth = authService.login(new LoginRequest(
                "prof.vikram@" + instCode.toLowerCase() + ".edu",
                "TeacherPass123!",
                instCode
        ));
        List<CourseOfferingDto> teacherCourses = academicService.getTeacherCourses(teacherAuth.userId());
        assertEquals(1, teacherCourses.size());
        assertEquals(offeringA.id(), teacherCourses.get(0).id());
        assertEquals("CS301", teacherCourses.get(0).subjectCode());
        assertEquals("A", teacherCourses.get(0).section());

        List<CourseRosterStudentDto> roster = attendanceService.getRosterForCourseOffering(teacherAuth.userId(), offeringA.id());
        assertEquals(2, roster.size());

        // 12. Student logs in and verifies enrolled subjects and assigned faculty name
        AuthResponse student1Auth = authService.login(new LoginRequest(
                "aarav@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                instCode
        ));
        List<CourseOfferingDto> student1Courses = academicService.getStudentCourses(student1Auth.userId());
        assertEquals(1, student1Courses.size());
        assertEquals("CS301", student1Courses.get(0).subjectCode());
        assertEquals("Data Structures and Algorithms", student1Courses.get(0).subjectName());
        assertEquals("A", student1Courses.get(0).section());
        assertEquals("Vikram Deshmukh", student1Courses.get(0).primaryTeacherName());

        // 13. Teacher records Attendance for Section A (Student 1 Present, Student 2 Absent)
        AttendanceSessionDto attSession = attendanceService.recordAttendance(teacherAuth.userId(), new AttendanceSaveRequest(
                offeringA.id(),
                LocalDate.now(),
                null,
                List.of(
                        new AttendanceRecordInput(student1.studentProfileId(), "PRESENT", "On time"),
                        new AttendanceRecordInput(student2.studentProfileId(), "ABSENT", "Absent")
                )
        ));
        assertNotNull(attSession.id());

        // 14. Student 1 & Student 2 verify their own individual attendance & forecasts
        OverallAttendanceSummaryDto s1Att = attendanceService.getStudentOverallAttendance(student1.userId());
        assertEquals(1, s1Att.totalConductedAcrossAll());
        assertEquals(1, s1Att.totalAttendedAcrossAll());
        assertEquals(new BigDecimal("100.00"), s1Att.overallPercentage());

        OverallAttendanceSummaryDto s2Att = attendanceService.getStudentOverallAttendance(student2.userId());
        assertEquals(1, s2Att.totalConductedAcrossAll());
        assertEquals(0, s2Att.totalAttendedAcrossAll());
        assertEquals(new BigDecimal("0.00"), s2Att.overallPercentage());
        assertTrue(s2Att.subjects().get(0).classesNeededForTarget() > 0);

        // 15. Teacher creates Assignment for Section A
        AssignmentDto assignment = assignmentService.createAssignment(teacherAuth.userId(), new CreateAssignmentRequest(
                offeringA.id(),
                "Lab 1: Red-Black Tree Implementation",
                "Implement insert and balance operations in Java",
                "Submit source zip",
                null,
                new BigDecimal("100.00"),
                new BigDecimal("10.00"),
                Instant.now().plusSeconds(86400 * 4),
                true,
                true
        ));
        assertNotNull(assignment.id());

        // 16. Student 1 submits coursework
        SubmissionDto sub1 = assignmentService.submitAssignment(student1.userId(), new SubmitAssignmentRequest(
                assignment.id(),
                "Complete RB Tree implementation with unit tests.",
                "https://storage.campusos.internal/uploads/rbtree-aarav.zip",
                "rbtree-aarav.zip",
                "sub-token-" + ts
        ));
        assertNotNull(sub1.id());

        // 17. Teacher grades Student 1's submission with 96.5 points & publishes marks
        GradeDto grade = assignmentService.gradeSubmission(teacherAuth.userId(), new GradeSubmissionRequest(
                assignment.id(),
                student1.studentProfileId(),
                sub1.id(),
                new BigDecimal("96.50"),
                "Flawless rotation logic and test coverage.",
                true
        ));
        assertTrue(grade.isPublished());
        assertEquals(new BigDecimal("96.50"), grade.marksObtained());

        // 18. Student 1 verifies grade in their Gradebook
        List<StudentGradebookSummaryDto> gradebook = assignmentService.getStudentGradebook(student1.userId());
        assertEquals(1, gradebook.size());
        assertEquals(new BigDecimal("96.50"), gradebook.get(0).totalMarksEarned());

        // 19. Security checks: Unauthorized teacher & student access prevention
        TeacherDetailDto unassignedTeacher = collegeAdminService.createTeacher(adminAuth.userId(), new CreateTeacherRequest(
                "prof.other@" + instCode.toLowerCase() + ".edu",
                "TeacherPass123!",
                "Other",
                "Prof",
                "+919876540009",
                "FAC-CS-009",
                "Lecturer",
                dept.id()
        ));
        assertThrows(UnauthorizedException.class, () -> {
            attendanceService.getRosterForCourseOffering(unassignedTeacher.userId(), offeringA.id());
        });

        StudentDetailDto studentSecB = collegeAdminService.createStudent(adminAuth.userId(), new CreateStudentRequest(
                "secb.student@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                "SectionB",
                "Student",
                "+919876540010",
                "STU-2026-099",
                2026,
                3,
                "B",
                dept.id(),
                prog.id()
        ));
        assertThrows(UnauthorizedException.class, () -> {
            assignmentService.submitAssignment(studentSecB.userId(), new SubmitAssignmentRequest(
                    assignment.id(),
                    "Attempt from un-enrolled section B student",
                    null,
                    null,
                    "bad-token"
            ));
        });

        // 20. Cross-Institution Security Defense: Admin from another college CANNOT use Apex's subject
        AuthResponse foreignAdmin = authService.bootstrapCollegeAdmin(new BootstrapAdminRequest(
                "FOREIGN_INST_" + ts,
                "Foreign University",
                "foreign.admin@" + ts + ".edu",
                "ForeignPass123!",
                "Foreign",
                "Dean",
                "UTC"
        ));
        assertThrows(UnauthorizedException.class, () -> {
            collegeAdminService.createCourseOffering(foreignAdmin.userId(), new CreateCourseOfferingRequest(
                    subject.id(), // Subject belonging to Apex Institute
                    term.id(),
                    "A",
                    null
            ));
        });

        // 21. Section Re-allocation and Auto-Enrollment verification
        StudentDetailDto movedStudent = collegeAdminService.allocateStudentSection(adminAuth.userId(), studentSecB.studentProfileId(), new AllocateStudentSectionRequest(
                "A", 3, dept.id(), prog.id()
        ));
        assertEquals("A", movedStudent.section());
        assertTrue(movedStudent.enrolledCourses().stream().anyMatch(c -> c.contains("CS301")));

        // 22. Admin Dashboard Metrics Summary verification
        AdminDashboardSummaryDto dashboard = collegeAdminService.getDashboardSummary(adminAuth.userId());
        assertEquals(3, dashboard.totalStudents());
        assertEquals(2, dashboard.totalTeachers());
        assertEquals(1, dashboard.totalDepartments());
        assertEquals(1, dashboard.totalPrograms());
        assertEquals(1, dashboard.totalSubjects());
        assertEquals(1, dashboard.totalCourseOfferings());
        assertEquals(1, dashboard.totalActiveTerms());
    }
}
