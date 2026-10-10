package com.campusos;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.repository.AcademicTermRepository;
import com.campusos.repository.CourseOfferingRepository;
import com.campusos.repository.DepartmentRepository;
import com.campusos.repository.EnrollmentRepository;
import com.campusos.repository.InstitutionRepository;
import com.campusos.repository.StudentProfileRepository;
import com.campusos.repository.SubjectRepository;
import com.campusos.repository.TeacherProfileRepository;
import com.campusos.repository.TeachingAssignmentRepository;
import com.campusos.service.AssignmentService;
import com.campusos.service.AttendanceService;
import com.campusos.service.AuthService;
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
class AcademicWorkflowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AcademicTermRepository academicTermRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private CourseOfferingRepository courseOfferingRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private TeachingAssignmentRepository teachingAssignmentRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Test
    @DisplayName("Verify end-to-end Attendance recording, percentage calculation, and formula forecast")
    void testAttendanceWorkflow() {
        // 1. Setup Student & Teacher
        AuthResponse studentAuth = authService.register(new RegisterRequest(
                "TEST_INST", "student.att@" + System.currentTimeMillis() + ".edu", "Pass1234!",
                "Rohan", "Verma", null, "ROLE_STUDENT", "STU-" + System.currentTimeMillis(),
                2026, 1, "A", null, null, null, null
        ));

        AuthResponse teacherAuth = authService.register(new RegisterRequest(
                "TEST_INST", "teacher.att@" + System.currentTimeMillis() + ".edu", "Pass1234!",
                "Prof. Gupta", "Kumar", null, "ROLE_TEACHER", null, null, null, null,
                "FAC-" + System.currentTimeMillis(), "Professor", null, null
        ));

        Institution inst = institutionRepository.findById(studentAuth.institutionId()).orElseThrow();
        Department dept = departmentRepository.save(Department.builder().institution(inst).code("CS").name("Computer Science").build());
        AcademicTerm term = academicTermRepository.save(AcademicTerm.builder().institution(inst).name("Fall 2026").academicYear("2026-2027").startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(4)).isCurrent(true).build());
        Subject subject = subjectRepository.save(Subject.builder().institution(inst).department(dept).code("CS301").name("Data Structures & Algorithms").credits(4).build());
        CourseOffering co = courseOfferingRepository.save(CourseOffering.builder().institution(inst).subject(subject).academicTerm(term).section("A").build());

        StudentProfile studentProf = studentProfileRepository.findById(studentAuth.studentProfileId()).orElseThrow();
        TeacherProfile teacherProf = teacherProfileRepository.findById(teacherAuth.teacherProfileId()).orElseThrow();

        enrollmentRepository.save(Enrollment.builder().courseOffering(co).student(studentProf).build());
        teachingAssignmentRepository.save(TeachingAssignment.builder().courseOffering(co).teacher(teacherProf).build());

        // 2. Teacher records attendance session for 2 dates: 1 Present, 1 Absent (50% attendance)
        attendanceService.recordAttendance(teacherAuth.userId(), new AttendanceSaveRequest(
                co.getId(), LocalDate.now().minusDays(1), null,
                Collections.singletonList(new AttendanceRecordInput(studentProf.getId(), "PRESENT", "On time"))
        ));

        attendanceService.recordAttendance(teacherAuth.userId(), new AttendanceSaveRequest(
                co.getId(), LocalDate.now(), null,
                Collections.singletonList(new AttendanceRecordInput(studentProf.getId(), "ABSENT", "Unexcused"))
        ));

        // 3. Verify student attendance percentage calculation
        OverallAttendanceSummaryDto summary = attendanceService.getStudentOverallAttendance(studentAuth.userId());
        assertNotNull(summary);
        assertEquals(2, summary.totalConductedAcrossAll());
        assertEquals(1, summary.totalAttendedAcrossAll());
        assertEquals(new BigDecimal("50.00"), summary.overallPercentage());
        assertFalse(summary.subjects().get(0).isEligible()); // 50% < 75% target
        assertTrue(summary.subjects().get(0).classesNeededForTarget() > 0); // Need recovery classes
    }

    @Test
    @DisplayName("Verify Assignment creation, student submission, and teacher grading")
    void testAssignmentAndGradingWorkflow() {
        AuthResponse studentAuth = authService.register(new RegisterRequest(
                "TEST_INST", "stu.assign@" + System.currentTimeMillis() + ".edu", "Pass1234!",
                "Neha", "Patel", null, "ROLE_STUDENT", "STU-" + System.currentTimeMillis(),
                2026, 1, "A", null, null, null, null
        ));

        AuthResponse teacherAuth = authService.register(new RegisterRequest(
                "TEST_INST", "teach.assign@" + System.currentTimeMillis() + ".edu", "Pass1234!",
                "Dr. Vikram", "Singh", null, "ROLE_TEACHER", null, null, null, null,
                "FAC-" + System.currentTimeMillis(), "Professor", null, null
        ));

        Institution inst = institutionRepository.findById(studentAuth.institutionId()).orElseThrow();
        Department dept = departmentRepository.save(Department.builder().institution(inst).code("IT").name("Information Tech").build());
        AcademicTerm term = academicTermRepository.save(AcademicTerm.builder().institution(inst).name("Fall 2026").academicYear("2026-2027").startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(4)).isCurrent(true).build());
        Subject subject = subjectRepository.save(Subject.builder().institution(inst).department(dept).code("IT201").name("Operating Systems").credits(3).build());
        CourseOffering co = courseOfferingRepository.save(CourseOffering.builder().institution(inst).subject(subject).academicTerm(term).section("A").build());

        StudentProfile studentProf = studentProfileRepository.findById(studentAuth.studentProfileId()).orElseThrow();
        TeacherProfile teacherProf = teacherProfileRepository.findById(teacherAuth.teacherProfileId()).orElseThrow();
        enrollmentRepository.save(Enrollment.builder().courseOffering(co).student(studentProf).build());
        teachingAssignmentRepository.save(TeachingAssignment.builder().courseOffering(co).teacher(teacherProf).build());

        // 1. Teacher creates Assignment
        AssignmentDto createdAssignment = assignmentService.createAssignment(teacherAuth.userId(), new CreateAssignmentRequest(
                co.getId(),
                "Lab 1: Process Scheduling Simulation",
                "Implement Round Robin scheduling in C or Java",
                "Submit code zip and report",
                null,
                new BigDecimal("100.00"),
                new BigDecimal("10.00"),
                Instant.now().plusSeconds(86400 * 3),
                true,
                true
        ));
        assertNotNull(createdAssignment.id());

        // 2. Student Submits
        SubmissionDto sub = assignmentService.submitAssignment(studentAuth.userId(), new SubmitAssignmentRequest(
                createdAssignment.id(),
                "Here is my solution code with full comments and test cases.",
                "https://storage.campusos.internal/uploads/lab1-submission.zip",
                "lab1-submission.zip",
                "idemp-key-001"
        ));
        assertNotNull(sub.id());
        assertFalse(sub.isLate());
        assertEquals(1, sub.versionNumber());

        // 3. Teacher Grades Submission
        GradeDto grade = assignmentService.gradeSubmission(teacherAuth.userId(), new GradeSubmissionRequest(
                createdAssignment.id(),
                studentProf.getId(),
                sub.id(),
                new BigDecimal("94.50"),
                "Excellent modular architecture and edge case handling.",
                true
        ));
        assertNotNull(grade.id());
        assertEquals(new BigDecimal("94.50"), grade.marksObtained());
        assertTrue(grade.isPublished());

        // 4. Student views Gradebook
        List<StudentGradebookSummaryDto> gradebook = assignmentService.getStudentGradebook(studentAuth.userId());
        assertFalse(gradebook.isEmpty());
        assertEquals(new BigDecimal("94.50"), gradebook.get(0).totalMarksEarned());
        assertEquals(new BigDecimal("94.50"), gradebook.get(0).percentage());
    }
}
