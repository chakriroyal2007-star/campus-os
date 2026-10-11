package com.campusos;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.BadRequestException;
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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class MasterAcceptanceScenarioIntegrationTest {

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

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Test
    @DisplayName("Test A: Actual login identity returns authenticated database record name and clears on switch")
    void testA_ActualLoginIdentity() {
        long ts = System.currentTimeMillis();
        String instCode = "INST_IDEN_" + ts;

        // 1. Create account for Ananya Rao
        AuthResponse user1 = authService.register(new RegisterRequest(
                instCode,
                "ananya.rao@" + instCode.toLowerCase() + ".edu",
                "Password123!",
                "Ananya",
                "Rao",
                "+919876543201",
                "ROLE_TEACHER",
                null,
                null,
                null,
                null,
                "FAC-ANANYA-01",
                "Assistant Professor",
                null,
                null
        ));

        // 2. Login as Ananya Rao
        AuthResponse login1 = authService.login(new LoginRequest(
                "ananya.rao@" + instCode.toLowerCase() + ".edu",
                "Password123!",
                instCode
        ));
        assertEquals("Ananya", login1.firstName());
        assertEquals("Rao", login1.lastName());
        assertEquals("ananya.rao@" + instCode.toLowerCase() + ".edu", login1.email());

        // 3. Create second account for Dev Kumar
        AuthResponse user2 = authService.register(new RegisterRequest(
                instCode,
                "dev.kumar@" + instCode.toLowerCase() + ".edu",
                "Password123!",
                "Dev",
                "Kumar",
                "+919876543202",
                "ROLE_STUDENT",
                "STU-DEV-01",
                2026,
                3,
                "A",
                null,
                null,
                null,
                null
        ));

        // 4. Login as Dev Kumar
        AuthResponse login2 = authService.login(new LoginRequest(
                "dev.kumar@" + instCode.toLowerCase() + ".edu",
                "Password123!",
                instCode
        ));
        assertEquals("Dev", login2.firstName());
        assertEquals("Kumar", login2.lastName());
        assertNotEquals(login1.userId(), login2.userId());
        assertNotEquals(login1.firstName(), login2.firstName());
    }

    @Test
    @DisplayName("Test B, C, D: End-to-End Admin Class Setup, Teacher Roster Visibility, and Student Teacher Connection")
    void testB_C_D_CompleteClassConnection() {
        long ts = System.currentTimeMillis();
        String instCode = "COLLEGE_" + ts;

        // Admin boots college
        AuthResponse admin = authService.bootstrapCollegeAdmin(new BootstrapAdminRequest(
                instCode,
                "Example Engineering College",
                "admin@" + instCode.toLowerCase() + ".edu",
                "AdminPass123!",
                "Dean",
                "Admin",
                "Asia/Kolkata"
        ));

        // Admin creates Semester 3
        AcademicTermDto term = collegeAdminService.createAcademicTerm(admin.userId(), new CreateAcademicTermRequest(
                "Semester 3",
                "2026-2027",
                LocalDate.now(),
                LocalDate.now().plusMonths(4),
                true
        ));

        // Admin creates Branch CSE
        DepartmentDto dept = collegeAdminService.createDepartment(admin.userId(), new CreateDepartmentRequest(
                "CSE",
                "Computer Science and Engineering"
        ));

        // Admin creates Program B.Tech CSE (Study Year 2 / Sem 3)
        ProgramDto prog = collegeAdminService.createProgram(admin.userId(), new CreateProgramRequest(
                dept.id(),
                "BTECH_CSE",
                "B.Tech Computer Science",
                "UNDERGRADUATE",
                4
        ));

        // Admin creates Subject DSA
        SubjectDto subject = collegeAdminService.createSubject(admin.userId(), new CreateSubjectRequest(
                dept.id(),
                "CS-DSA-301",
                "Data Structures and Algorithms",
                4,
                "Linear and non-linear data structures"
        ));

        // Admin creates Course Offering for Section A
        CourseOfferingDetailDto offeringA = collegeAdminService.createCourseOffering(admin.userId(), new CreateCourseOfferingRequest(
                subject.id(),
                term.id(),
                "A",
                null
        ));

        // Admin creates Teacher Ananya Rao
        TeacherDetailDto teacherAnanya = collegeAdminService.createTeacher(admin.userId(), new CreateTeacherRequest(
                "ananya.rao@" + instCode.toLowerCase() + ".edu",
                "FacultyPass123!",
                "Ananya",
                "Rao",
                "+919876541111",
                "FAC-DSA-101",
                "Assistant Professor",
                dept.id()
        ));

        // Admin assigns Teacher Ananya Rao to DSA offering
        CourseOfferingDetailDto assignedOffering = collegeAdminService.assignTeacher(admin.userId(), new AssignTeacherRequest(
                offeringA.id(),
                teacherAnanya.teacherProfileId()
        ));
        assertEquals(teacherAnanya.teacherProfileId(), assignedOffering.assignedTeacherId());
        assertEquals("Ananya Rao", assignedOffering.assignedTeacherName());

        // Admin creates 2 Students (Aarav Mehta & Sneha Patel) in Section A
        StudentDetailDto student1 = collegeAdminService.createStudent(admin.userId(), new CreateStudentRequest(
                "aarav.m@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                "Aarav",
                "Mehta",
                "+919876542221",
                "CSE-2026-001",
                2026,
                3,
                "A",
                dept.id(),
                prog.id()
        ));

        StudentDetailDto student2 = collegeAdminService.createStudent(admin.userId(), new CreateStudentRequest(
                "sneha.p@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                "Sneha",
                "Patel",
                "+919876542222",
                "CSE-2026-002",
                2026,
                3,
                "A",
                dept.id(),
                prog.id()
        ));

        // Teacher Test (Test C): Ananya Rao logs in and sees exactly offering A and both enrolled students
        AuthResponse teacherAuth = authService.login(new LoginRequest(
                "ananya.rao@" + instCode.toLowerCase() + ".edu",
                "FacultyPass123!",
                instCode
        ));
        List<CourseOfferingDto> teacherCourses = academicService.getTeacherCourses(teacherAuth.userId());
        assertEquals(1, teacherCourses.size());
        assertEquals("CS-DSA-301", teacherCourses.get(0).subjectCode());
        assertEquals("A", teacherCourses.get(0).section());

        List<CourseRosterStudentDto> roster = attendanceService.getRosterForCourseOffering(teacherAuth.userId(), offeringA.id());
        assertEquals(2, roster.size());
        assertTrue(roster.stream().anyMatch(s -> s.studentName().equals("Aarav Mehta") && s.studentIdNumber().equals("CSE-2026-001")));
        assertTrue(roster.stream().anyMatch(s -> s.studentName().equals("Sneha Patel") && s.studentIdNumber().equals("CSE-2026-002")));

        // Unassigned teacher is rejected
        TeacherDetailDto otherTeacher = collegeAdminService.createTeacher(admin.userId(), new CreateTeacherRequest(
                "other.teacher@" + instCode.toLowerCase() + ".edu",
                "FacultyPass123!",
                "Other",
                "Teacher",
                "+919876543333",
                "FAC-ECE-999",
                "Lecturer",
                dept.id()
        ));
        assertThrows(UnauthorizedException.class, () -> {
            attendanceService.getRosterForCourseOffering(otherTeacher.userId(), offeringA.id());
        });

        // Student Test (Test D): Aarav logs in and sees DSA and assigned teacher "Ananya Rao"
        AuthResponse studentAuth = authService.login(new LoginRequest(
                "aarav.m@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                instCode
        ));
        List<CourseOfferingDto> studentCourses = academicService.getStudentCourses(studentAuth.userId());
        assertEquals(1, studentCourses.size());
        assertEquals("CS-DSA-301", studentCourses.get(0).subjectCode());
        assertEquals("Data Structures and Algorithms", studentCourses.get(0).subjectName());
        assertEquals("Ananya Rao", studentCourses.get(0).primaryTeacherName());
        assertEquals("A", studentCourses.get(0).section());

        // Student in Section B does not see Section A offering
        StudentDetailDto studentSecB = collegeAdminService.createStudent(admin.userId(), new CreateStudentRequest(
                "secb.user@" + instCode.toLowerCase() + ".edu",
                "StudentPass123!",
                "Bobby",
                "Deol",
                "+919876544444",
                "CSE-2026-099",
                2026,
                3,
                "B",
                dept.id(),
                prog.id()
        ));
        List<CourseOfferingDto> secBCourses = academicService.getStudentCourses(studentSecB.userId());
        assertTrue(secBCourses.isEmpty());
    }

    @Test
    @DisplayName("Test E: Security and Multi-Tenant Isolation")
    void testE_SecurityAndTenantIsolation() {
        long ts = System.currentTimeMillis();
        String codeA = "TENANT_A_" + ts;
        String codeB = "TENANT_B_" + ts;

        AuthResponse adminA = authService.bootstrapCollegeAdmin(new BootstrapAdminRequest(
                codeA, "College A", "admin@" + codeA.toLowerCase() + ".edu", "Pass123!", "Dean", "A", "UTC"
        ));

        AuthResponse adminB = authService.bootstrapCollegeAdmin(new BootstrapAdminRequest(
                codeB, "College B", "admin@" + codeB.toLowerCase() + ".edu", "Pass123!", "Dean", "B", "UTC"
        ));

        DepartmentDto deptA = collegeAdminService.createDepartment(adminA.userId(), new CreateDepartmentRequest("CSE", "CSE Dept A"));
        SubjectDto subjectA = collegeAdminService.createSubject(adminA.userId(), new CreateSubjectRequest(deptA.id(), "CS101", "Intro CS", 3, ""));
        AcademicTermDto termA = collegeAdminService.createAcademicTerm(adminA.userId(), new CreateAcademicTermRequest("Term 1", "2026", LocalDate.now(), LocalDate.now().plusMonths(3), true));

        // Admin B attempts to create offering using College A's subject -> Blocked!
        assertThrows(UnauthorizedException.class, () -> {
            collegeAdminService.createCourseOffering(adminB.userId(), new CreateCourseOfferingRequest(
                    subjectA.id(),
                    termA.id(),
                    "A",
                    null
            ));
        });

        // Duplicate registration with same email in same institution is blocked
        assertThrows(BadRequestException.class, () -> {
            authService.register(new RegisterRequest(
                    codeA,
                    "admin@" + codeA.toLowerCase() + ".edu",
                    "NewPass123!",
                    "Fake",
                    "Admin",
                    null,
                    "ROLE_STUDENT",
                    "STU-DUP",
                    2026,
                    1,
                    "A",
                    null,
                    null,
                    null,
                    null
            ));
        });
    }

    @Test
    @DisplayName("Test F: Clean empty state when no courses exist")
    void testF_CleanEmptyState() {
        long ts = System.currentTimeMillis();
        String code = "EMPTY_INST_" + ts;

        AuthResponse student = authService.register(new RegisterRequest(
                code,
                "fresh.student@" + code.toLowerCase() + ".edu",
                "Password123!",
                "Fresh",
                "Student",
                null,
                "ROLE_STUDENT",
                "STU-FRESH",
                2026,
                1,
                "Z", // No offerings exist in section Z
                null,
                null,
                null,
                null
        ));

        List<CourseOfferingDto> courses = academicService.getStudentCourses(student.userId());
        assertNotNull(courses);
        assertTrue(courses.isEmpty()); // Clean empty state, no mock data fabricated!

        OverallAttendanceSummaryDto att = attendanceService.getStudentOverallAttendance(student.userId());
        assertNotNull(att);
        assertEquals(0, att.totalConductedAcrossAll());
        assertEquals(0, att.totalAttendedAcrossAll());
        assertEquals(BigDecimal.ZERO, att.overallPercentage());
        assertTrue(att.subjects().isEmpty());
    }
}
