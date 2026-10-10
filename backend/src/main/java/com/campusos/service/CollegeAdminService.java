package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.BadRequestException;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.exception.UnauthorizedException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollegeAdminService {

    private final UserAccountRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final AcademicTermRepository academicTermRepository;
    private final SubjectRepository subjectRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendancePolicyRepository attendancePolicyRepository;
    private final ClassSessionRepository classSessionRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    private UserAccount getAuthorizedAdmin(UUID adminUserId) {
        UserAccount admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found: " + adminUserId));
        boolean isAdmin = admin.getRoles().stream()
                .anyMatch(r -> "ROLE_COLLEGE_ADMIN".equals(r.getRole()) || "ROLE_ADMIN".equals(r.getRole()) || "ROLE_SUPER_ADMIN".equals(r.getRole()));
        if (!isAdmin) {
            throw new UnauthorizedException("User does not hold college administrator privileges.");
        }
        return admin;
    }

    // --- DASHBOARD SUMMARY ---
    @Transactional(readOnly = true)
    public AdminDashboardSummaryDto getDashboardSummary(UUID adminUserId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();
        UUID instId = inst.getId();

        long totalStudents = studentProfileRepository.findAll().stream()
                .filter(s -> instId.equals(s.getInstitution().getId())).count();
        long totalTeachers = teacherProfileRepository.findAll().stream()
                .filter(t -> instId.equals(t.getInstitution().getId())).count();
        long totalDepts = departmentRepository.findAll().stream()
                .filter(d -> instId.equals(d.getInstitution().getId())).count();
        long totalPrograms = programRepository.findAll().stream()
                .filter(p -> instId.equals(p.getInstitution().getId())).count();
        long totalSubjects = subjectRepository.findAll().stream()
                .filter(s -> instId.equals(s.getInstitution().getId())).count();
        long totalOfferings = courseOfferingRepository.findAll().stream()
                .filter(c -> instId.equals(c.getInstitution().getId())).count();
        long totalActiveTerms = academicTermRepository.findAll().stream()
                .filter(a -> instId.equals(a.getInstitution().getId()) && Boolean.TRUE.equals(a.getIsCurrent())).count();
        long totalClassSessions = classSessionRepository.findAll().stream()
                .filter(cs -> instId.equals(cs.getCourseOffering().getInstitution().getId())).count();

        return new AdminDashboardSummaryDto(
                inst.getId(),
                inst.getName(),
                inst.getCode(),
                totalStudents,
                totalTeachers,
                totalDepts,
                totalPrograms,
                totalSubjects,
                totalOfferings,
                totalActiveTerms,
                totalClassSessions
        );
    }

    // --- INSTITUTION PROFILE ---
    @Transactional(readOnly = true)
    public InstitutionDetailDto getInstitution(UUID adminUserId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();
        BigDecimal threshold = attendancePolicyRepository.findByInstitutionId(inst.getId())
                .map(AttendancePolicy::getMinimumPercentage)
                .orElse(new BigDecimal("75.00"));

        return new InstitutionDetailDto(
                inst.getId(),
                inst.getCode(),
                inst.getName(),
                inst.getDomain(),
                inst.getTimezone(),
                inst.getCreatedAt(),
                threshold
        );
    }

    @Transactional
    public InstitutionDetailDto updateInstitution(UUID adminUserId, UpdateInstitutionRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        inst.setName(req.name());
        if (req.domain() != null) inst.setDomain(req.domain());
        if (req.timezone() != null) inst.setTimezone(req.timezone());
        institutionRepository.save(inst);

        if (req.minimumAttendanceThreshold() != null) {
            AttendancePolicy policy = attendancePolicyRepository.findByInstitutionId(inst.getId())
                    .orElseGet(() -> AttendancePolicy.builder().institution(inst).build());
            policy.setMinimumPercentage(req.minimumAttendanceThreshold());
            attendancePolicyRepository.save(policy);
        }

        return getInstitution(adminUserId);
    }

    // --- DEPARTMENTS & PROGRAMS ---
    @Transactional(readOnly = true)
    public List<DepartmentDto> getDepartments(UUID adminUserId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();
        return departmentRepository.findAll().stream()
                .filter(d -> instId.equals(d.getInstitution().getId()))
                .map(d -> {
                    long progCount = programRepository.findAll().stream()
                            .filter(p -> p.getDepartment() != null && d.getId().equals(p.getDepartment().getId())).count();
                    long subjCount = subjectRepository.findAll().stream()
                            .filter(s -> s.getDepartment() != null && d.getId().equals(s.getDepartment().getId())).count();
                    return new DepartmentDto(d.getId(), d.getCode(), d.getName(), progCount, subjCount, d.getCreatedAt());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(UUID adminUserId, CreateDepartmentRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        Department dept = Department.builder()
                .institution(inst)
                .code(req.code().toUpperCase())
                .name(req.name())
                .build();
        dept = departmentRepository.save(dept);

        return new DepartmentDto(dept.getId(), dept.getCode(), dept.getName(), 0, 0, dept.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ProgramDto> getPrograms(UUID adminUserId, UUID departmentId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return programRepository.findAll().stream()
                .filter(p -> instId.equals(p.getInstitution().getId()))
                .filter(p -> departmentId == null || (p.getDepartment() != null && departmentId.equals(p.getDepartment().getId())))
                .map(p -> new ProgramDto(
                        p.getId(),
                        p.getDepartment() != null ? p.getDepartment().getId() : null,
                        p.getDepartment() != null ? p.getDepartment().getName() : null,
                        p.getCode(),
                        p.getName(),
                        p.getDegreeType(),
                        p.getDurationYears(),
                        p.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProgramDto createProgram(UUID adminUserId, CreateProgramRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + req.departmentId()));
        if (!inst.getId().equals(dept.getInstitution().getId())) {
            throw new UnauthorizedException("Department does not belong to your institution.");
        }

        Program prog = Program.builder()
                .institution(inst)
                .department(dept)
                .code(req.code().toUpperCase())
                .name(req.name())
                .degreeType(req.degreeType())
                .durationYears(req.durationYears() > 0 ? req.durationYears() : 4)
                .build();
        prog = programRepository.save(prog);

        return new ProgramDto(
                prog.getId(),
                dept.getId(),
                dept.getName(),
                prog.getCode(),
                prog.getName(),
                prog.getDegreeType(),
                prog.getDurationYears(),
                prog.getCreatedAt()
        );
    }

    // --- ACADEMIC TERMS ---
    @Transactional(readOnly = true)
    public List<AcademicTermDto> getAcademicTerms(UUID adminUserId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return academicTermRepository.findAll().stream()
                .filter(t -> instId.equals(t.getInstitution().getId()))
                .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
                .map(t -> new AcademicTermDto(
                        t.getId(),
                        t.getName(),
                        t.getAcademicYear(),
                        t.getStartDate(),
                        t.getEndDate(),
                        Boolean.TRUE.equals(t.getIsCurrent()),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public AcademicTermDto createAcademicTerm(UUID adminUserId, CreateAcademicTermRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        if (req.endDate().isBefore(req.startDate())) {
            throw new BadRequestException("Term end date cannot be before start date.");
        }

        if (req.isCurrent()) {
            // Demote other current terms
            academicTermRepository.findAll().stream()
                    .filter(t -> inst.getId().equals(t.getInstitution().getId()) && Boolean.TRUE.equals(t.getIsCurrent()))
                    .forEach(t -> {
                        t.setIsCurrent(false);
                        academicTermRepository.save(t);
                    });
        }

        AcademicTerm term = AcademicTerm.builder()
                .institution(inst)
                .name(req.name())
                .academicYear(req.academicYear())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .isCurrent(req.isCurrent())
                .build();
        term = academicTermRepository.save(term);

        return new AcademicTermDto(
                term.getId(),
                term.getName(),
                term.getAcademicYear(),
                term.getStartDate(),
                term.getEndDate(),
                Boolean.TRUE.equals(term.getIsCurrent()),
                term.getCreatedAt()
        );
    }

    // --- SUBJECTS CATALOG ---
    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjects(UUID adminUserId, UUID departmentId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return subjectRepository.findAll().stream()
                .filter(s -> instId.equals(s.getInstitution().getId()))
                .filter(s -> departmentId == null || (s.getDepartment() != null && departmentId.equals(s.getDepartment().getId())))
                .map(s -> new SubjectDto(
                        s.getId(),
                        s.getDepartment() != null ? s.getDepartment().getId() : null,
                        s.getDepartment() != null ? s.getDepartment().getName() : null,
                        s.getCode(),
                        s.getName(),
                        s.getCredits(),
                        s.getDescription(),
                        s.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(UUID adminUserId, CreateSubjectRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + req.departmentId()));
        if (!inst.getId().equals(dept.getInstitution().getId())) {
            throw new UnauthorizedException("Department does not belong to your institution.");
        }

        Subject subj = Subject.builder()
                .institution(inst)
                .department(dept)
                .code(req.code().toUpperCase())
                .name(req.name())
                .credits(req.credits() > 0 ? req.credits() : 3)
                .description(req.description())
                .build();
        subj = subjectRepository.save(subj);

        return new SubjectDto(
                subj.getId(),
                dept.getId(),
                dept.getName(),
                subj.getCode(),
                subj.getName(),
                subj.getCredits(),
                subj.getDescription(),
                subj.getCreatedAt()
        );
    }

    // --- COURSE OFFERINGS & TEACHING ASSIGNMENTS ---
    @Transactional(readOnly = true)
    public List<CourseOfferingDetailDto> getCourseOfferings(UUID adminUserId, UUID termId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return courseOfferingRepository.findAll().stream()
                .filter(co -> instId.equals(co.getInstitution().getId()))
                .filter(co -> termId == null || (co.getAcademicTerm() != null && termId.equals(co.getAcademicTerm().getId())))
                .map(this::mapCourseOfferingDetail)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseOfferingDetailDto createCourseOffering(UUID adminUserId, CreateCourseOfferingRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.subjectId()));
        AcademicTerm term = academicTermRepository.findById(req.academicTermId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic term not found: " + req.academicTermId()));

        if (!inst.getId().equals(subject.getInstitution().getId()) || !inst.getId().equals(term.getInstitution().getId())) {
            throw new UnauthorizedException("Subject or term does not belong to your institution.");
        }

        CourseOffering co = CourseOffering.builder()
                .institution(inst)
                .subject(subject)
                .academicTerm(term)
                .section(req.section().toUpperCase())
                .build();
        final CourseOffering savedCo = courseOfferingRepository.save(co);

        if (req.assignedTeacherProfileId() != null) {
            TeacherProfile teacher = teacherProfileRepository.findById(req.assignedTeacherProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found: " + req.assignedTeacherProfileId()));
            TeachingAssignment ta = TeachingAssignment.builder()
                    .courseOffering(savedCo)
                    .teacher(teacher)
                    .isPrimary(true)
                    .build();
            teachingAssignmentRepository.save(ta);
        }

        // Auto-enroll all existing students in the institution who belong to this section
        List<StudentProfile> matchingStudents = studentProfileRepository.findAll().stream()
                .filter(s -> inst.getId().equals(s.getInstitution().getId()))
                .filter(s -> savedCo.getSection().equalsIgnoreCase(s.getSection()))
                .collect(Collectors.toList());

        for (StudentProfile s : matchingStudents) {
            boolean alreadyEnrolled = enrollmentRepository.findByCourseOfferingId(savedCo.getId()).stream()
                    .anyMatch(e -> s.getId().equals(e.getStudent().getId()));
            if (!alreadyEnrolled) {
                Enrollment e = Enrollment.builder()
                        .courseOffering(savedCo)
                        .student(s)
                        .status("ENROLLED")
                        .build();
                enrollmentRepository.save(e);
            }
        }

        return mapCourseOfferingDetail(savedCo);
    }

    @Transactional
    public CourseOfferingDetailDto assignTeacher(UUID adminUserId, AssignTeacherRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));
        TeacherProfile teacher = teacherProfileRepository.findById(req.teacherProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found: " + req.teacherProfileId()));

        if (!inst.getId().equals(co.getInstitution().getId()) || !inst.getId().equals(teacher.getInstitution().getId())) {
            throw new UnauthorizedException("Target entity does not belong to your institution.");
        }

        List<TeachingAssignment> existing = teachingAssignmentRepository.findByCourseOfferingId(co.getId());
        teachingAssignmentRepository.deleteAll(existing);

        TeachingAssignment ta = TeachingAssignment.builder()
                .courseOffering(co)
                .teacher(teacher)
                .isPrimary(true)
                .build();
        teachingAssignmentRepository.save(ta);

        return mapCourseOfferingDetail(co);
    }

    private CourseOfferingDetailDto mapCourseOfferingDetail(CourseOffering co) {
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByCourseOfferingId(co.getId());
        UUID teacherId = null;
        String teacherName = "Unassigned";
        if (!assignments.isEmpty()) {
            TeacherProfile prof = assignments.get(0).getTeacher();
            teacherId = prof.getId();
            teacherName = prof.getUser().getFullName();
        }

        long enrolledCount = enrollmentRepository.findAll().stream()
                .filter(e -> co.getId().equals(e.getCourseOffering().getId())).count();

        return new CourseOfferingDetailDto(
                co.getId(),
                co.getSubject().getId(),
                co.getSubject().getCode(),
                co.getSubject().getName(),
                co.getSubject().getCredits(),
                co.getAcademicTerm().getId(),
                co.getAcademicTerm().getName(),
                co.getSection(),
                teacherId,
                teacherName,
                enrolledCount,
                co.getCreatedAt()
        );
    }

    // --- STUDENT DIRECTORY & CSV BULK IMPORT ---
    @Transactional(readOnly = true)
    public List<StudentDetailDto> getStudents(UUID adminUserId, Integer batchYear, String section) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return studentProfileRepository.findAll().stream()
                .filter(s -> instId.equals(s.getInstitution().getId()))
                .filter(s -> batchYear == null || batchYear.equals(s.getBatchYear()))
                .filter(s -> section == null || section.equalsIgnoreCase(s.getSection()))
                .map(this::mapStudentDetail)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentDetailDto createStudent(UUID adminUserId, CreateStudentRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        if (userRepository.existsByInstitutionIdAndEmail(inst.getId(), req.email())) {
            throw new BadRequestException("Account with email " + req.email() + " already exists in this institution.");
        }

        Department dept = req.departmentId() != null ? departmentRepository.findById(req.departmentId()).orElse(null) : null;
        Program prog = req.programId() != null ? programRepository.findById(req.programId()).orElse(null) : null;

        UserAccount user = UserAccount.builder()
                .institution(inst)
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phoneNumber(req.phoneNumber())
                .isActive(true)
                .build();
        UserRole role = UserRole.builder().user(user).role("ROLE_STUDENT").build();
        user.getRoles().add(role);
        user = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .institution(inst)
                .department(dept)
                .program(prog)
                .studentIdNumber(req.studentIdNumber())
                .batchYear(req.batchYear() > 0 ? req.batchYear() : 2026)
                .currentSemester(req.currentSemester() > 0 ? req.currentSemester() : 1)
                .section(req.section().toUpperCase())
                .enrollmentStatus("ACTIVE")
                .build();
        profile = studentProfileRepository.save(profile);

        // Automatically enroll in active course offerings matching section
        autoEnrollMatchingSection(inst.getId(), profile, profile.getSection());

        return mapStudentDetail(profile);
    }

    @Transactional
    public BulkImportResultDto bulkImportStudents(UUID adminUserId, BulkStudentImportRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        Department dept = req.departmentId() != null ? departmentRepository.findById(req.departmentId()).orElse(null) : null;
        Program prog = req.programId() != null ? programRepository.findById(req.programId()).orElse(null) : null;

        List<StudentDetailDto> imported = new ArrayList<>();
        List<StudentRowImportError> errors = new ArrayList<>();

        int rowNum = 0;
        try (BufferedReader reader = new BufferedReader(new StringReader(req.csvContent()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                rowNum++;

                // Skip CSV header if present
                if (rowNum == 1 && (line.toLowerCase().contains("email") || line.toLowerCase().contains("roll") || line.toLowerCase().contains("first_name"))) {
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length < 4) {
                    errors.add(new StudentRowImportError(rowNum, "N/A", "N/A", "Insufficient columns. Expected: studentIdNumber,firstName,lastName,email,[password],[section],[batchYear],[semester]"));
                    continue;
                }

                String roll = parts[0].trim();
                String firstName = parts[1].trim();
                String lastName = parts[2].trim();
                String email = parts[3].trim();
                String password = parts.length > 4 && !parts[4].trim().isEmpty() ? parts[4].trim() : "CampusPass123!";
                String section = parts.length > 5 && !parts[5].trim().isEmpty() ? parts[5].trim().toUpperCase() : (req.defaultSection() != null ? req.defaultSection() : "A");
                int batchYear = parts.length > 6 && !parts[6].trim().isEmpty() ? Integer.parseInt(parts[6].trim()) : (req.batchYear() != null ? req.batchYear() : 2026);
                int sem = parts.length > 7 && !parts[7].trim().isEmpty() ? Integer.parseInt(parts[7].trim()) : (req.currentSemester() != null ? req.currentSemester() : 1);

                if (userRepository.existsByInstitutionIdAndEmail(inst.getId(), email)) {
                    errors.add(new StudentRowImportError(rowNum, roll, email, "Duplicate email in institution."));
                    continue;
                }

                try {
                    UserAccount user = UserAccount.builder()
                            .institution(inst)
                            .email(email)
                            .passwordHash(passwordEncoder.encode(password))
                            .firstName(firstName)
                            .lastName(lastName)
                            .isActive(true)
                            .build();
                    UserRole role = UserRole.builder().user(user).role("ROLE_STUDENT").build();
                    user.getRoles().add(role);
                    user = userRepository.save(user);

                    StudentProfile profile = StudentProfile.builder()
                            .user(user)
                            .institution(inst)
                            .department(dept)
                            .program(prog)
                            .studentIdNumber(roll)
                            .batchYear(batchYear)
                            .currentSemester(sem)
                            .section(section)
                            .enrollmentStatus("ACTIVE")
                            .build();
                    profile = studentProfileRepository.save(profile);

                    autoEnrollMatchingSection(inst.getId(), profile, section);
                    imported.add(mapStudentDetail(profile));
                } catch (Exception ex) {
                    errors.add(new StudentRowImportError(rowNum, roll, email, ex.getMessage()));
                }
            }
        } catch (Exception ex) {
            log.error("CSV import parsing error", ex);
            throw new BadRequestException("Failed to parse CSV: " + ex.getMessage());
        }

        return new BulkImportResultDto(rowNum, imported.size(), errors.size(), imported, errors);
    }

    private void autoEnrollMatchingSection(UUID institutionId, StudentProfile student, String section) {
        if (section == null || section.isBlank()) return;
        List<CourseOffering> matchingOfferings = courseOfferingRepository.findAll().stream()
                .filter(co -> institutionId.equals(co.getInstitution().getId()))
                .filter(co -> section.equalsIgnoreCase(co.getSection()))
                .collect(Collectors.toList());

        for (CourseOffering co : matchingOfferings) {
            boolean alreadyEnrolled = enrollmentRepository.findByCourseOfferingId(co.getId()).stream()
                    .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
            if (!alreadyEnrolled) {
                Enrollment e = Enrollment.builder()
                        .courseOffering(co)
                        .student(student)
                        .status("ENROLLED")
                        .build();
                enrollmentRepository.save(e);
            }
        }
    }

    private StudentDetailDto mapStudentDetail(StudentProfile s) {
        List<String> enrolledCourseNames = enrollmentRepository.findAll().stream()
                .filter(e -> s.getId().equals(e.getStudent().getId()))
                .map(e -> e.getCourseOffering().getSubject().getCode() + " - " + e.getCourseOffering().getSubject().getName())
                .collect(Collectors.toList());

        return new StudentDetailDto(
                s.getId(),
                s.getUser().getId(),
                s.getStudentIdNumber(),
                s.getUser().getFirstName(),
                s.getUser().getLastName(),
                s.getUser().getFullName(),
                s.getUser().getEmail(),
                s.getUser().getPhoneNumber(),
                s.getBatchYear(),
                s.getCurrentSemester(),
                s.getSection(),
                s.getEnrollmentStatus(),
                s.getDepartment() != null ? s.getDepartment().getId() : null,
                s.getDepartment() != null ? s.getDepartment().getName() : null,
                s.getProgram() != null ? s.getProgram().getId() : null,
                s.getProgram() != null ? s.getProgram().getName() : null,
                s.getUser().getIsActive(),
                enrolledCourseNames
        );
    }

    // --- TEACHER DIRECTORY & MANAGEMENT ---
    @Transactional(readOnly = true)
    public List<TeacherDetailDto> getTeachers(UUID adminUserId) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        UUID instId = admin.getInstitution().getId();

        return teacherProfileRepository.findAll().stream()
                .filter(t -> instId.equals(t.getInstitution().getId()))
                .map(this::mapTeacherDetail)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeacherDetailDto createTeacher(UUID adminUserId, CreateTeacherRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        if (userRepository.existsByInstitutionIdAndEmail(inst.getId(), req.email())) {
            throw new BadRequestException("Account with email " + req.email() + " already exists in this institution.");
        }

        Department dept = req.departmentId() != null ? departmentRepository.findById(req.departmentId()).orElse(null) : null;

        UserAccount user = UserAccount.builder()
                .institution(inst)
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phoneNumber(req.phoneNumber())
                .isActive(true)
                .build();
        UserRole role = UserRole.builder().user(user).role("ROLE_TEACHER").build();
        user.getRoles().add(role);
        user = userRepository.save(user);

        TeacherProfile profile = TeacherProfile.builder()
                .user(user)
                .institution(inst)
                .department(dept)
                .facultyIdNumber(req.facultyIdNumber())
                .designation(req.designation() != null ? req.designation() : "Assistant Professor")
                .employmentStatus("ACTIVE")
                .build();
        profile = teacherProfileRepository.save(profile);

        return mapTeacherDetail(profile);
    }

    private TeacherDetailDto mapTeacherDetail(TeacherProfile t) {
        List<String> assignedCourseNames = teachingAssignmentRepository.findAll().stream()
                .filter(ta -> t.getId().equals(ta.getTeacher().getId()))
                .map(ta -> ta.getCourseOffering().getSubject().getCode() + " (Sec " + ta.getCourseOffering().getSection() + ")")
                .collect(Collectors.toList());

        return new TeacherDetailDto(
                t.getId(),
                t.getUser().getId(),
                t.getFacultyIdNumber(),
                t.getUser().getFirstName(),
                t.getUser().getLastName(),
                t.getUser().getFullName(),
                t.getUser().getEmail(),
                t.getUser().getPhoneNumber(),
                t.getDesignation(),
                t.getEmploymentStatus(),
                t.getDepartment() != null ? t.getDepartment().getId() : null,
                t.getDepartment() != null ? t.getDepartment().getName() : null,
                t.getUser().getIsActive(),
                assignedCourseNames
        );
    }

    // --- ENROLLMENT ALLOCATION ---
    @Transactional
    public void enrollStudent(UUID adminUserId, EnrollStudentRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));
        StudentProfile student = studentProfileRepository.findById(req.studentProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + req.studentProfileId()));

        if (!inst.getId().equals(co.getInstitution().getId()) || !inst.getId().equals(student.getInstitution().getId())) {
            throw new UnauthorizedException("Target entity does not belong to your institution.");
        }

        boolean alreadyEnrolled = enrollmentRepository.findByCourseOfferingId(co.getId()).stream()
                .anyMatch(e -> student.getId().equals(e.getStudent().getId()));
        if (!alreadyEnrolled) {
            Enrollment e = Enrollment.builder()
                    .courseOffering(co)
                    .student(student)
                    .status("ENROLLED")
                    .build();
            enrollmentRepository.save(e);
        }
    }

    // --- TIMETABLE SCHEDULING ---
    @Transactional
    public ClassSessionDto scheduleClassSession(UUID adminUserId, CreateClassSessionScheduleRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        CourseOffering co = courseOfferingRepository.findById(req.courseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + req.courseOfferingId()));
        if (!inst.getId().equals(co.getInstitution().getId())) {
            throw new UnauthorizedException("Course offering does not belong to your institution.");
        }

        Room room = req.roomId() != null ? roomRepository.findById(req.roomId()).orElse(null) : null;

        ClassSession session = ClassSession.builder()
                .courseOffering(co)
                .room(room)
                .dayOfWeek(req.dayOfWeek())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .recurrenceType(req.recurrenceType() != null ? req.recurrenceType() : "WEEKLY")
                .sessionTitle(req.sessionTitle() != null ? req.sessionTitle() : co.getSubject().getName() + " Lecture")
                .build();
        session = classSessionRepository.save(session);

        String teacherName = "Unassigned";
        List<TeachingAssignment> ta = teachingAssignmentRepository.findByCourseOfferingId(co.getId());
        if (!ta.isEmpty()) {
            teacherName = ta.get(0).getTeacher().getUser().getFullName();
        }

        return new ClassSessionDto(
                session.getId(),
                co.getId(),
                co.getSubject().getCode(),
                co.getSubject().getName(),
                co.getSection(),
                session.getDayOfWeek(),
                session.getStartTime(),
                session.getEndTime(),
                room != null ? room.getRoomNumber() : "TBD",
                room != null ? room.getBuilding() : "Main",
                teacherName,
                false,
                null
        );
    }

    // --- SECTION RE-ALLOCATION & BULK SECTION AUTO-ENROLLMENT ---
    @Transactional
    public StudentDetailDto allocateStudentSection(UUID adminUserId, UUID studentProfileId, AllocateStudentSectionRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        StudentProfile student = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + studentProfileId));

        if (!inst.getId().equals(student.getInstitution().getId())) {
            throw new UnauthorizedException("Student does not belong to your institution.");
        }

        String newSection = req.section().trim().toUpperCase();
        student.setSection(newSection);

        if (req.currentSemester() != null && req.currentSemester() > 0) {
            student.setCurrentSemester(req.currentSemester());
        }
        if (req.departmentId() != null) {
            Department dept = departmentRepository.findById(req.departmentId()).orElse(null);
            student.setDepartment(dept);
        }
        if (req.programId() != null) {
            Program prog = programRepository.findById(req.programId()).orElse(null);
            student.setProgram(prog);
        }

        student = studentProfileRepository.save(student);

        // Auto-enroll student into active course offerings for the new section
        autoEnrollMatchingSection(inst.getId(), student, newSection);

        return mapStudentDetail(student);
    }

    @Transactional
    public AutoEnrollSectionResultDto autoEnrollSection(UUID adminUserId, AutoEnrollSectionRequest req) {
        UserAccount admin = getAuthorizedAdmin(adminUserId);
        Institution inst = admin.getInstitution();

        String section = req.section().trim().toUpperCase();

        List<StudentProfile> sectionStudents = studentProfileRepository.findAll().stream()
                .filter(s -> inst.getId().equals(s.getInstitution().getId()))
                .filter(s -> section.equalsIgnoreCase(s.getSection()))
                .collect(Collectors.toList());

        List<CourseOffering> sectionOfferings = courseOfferingRepository.findAll().stream()
                .filter(co -> inst.getId().equals(co.getInstitution().getId()))
                .filter(co -> section.equalsIgnoreCase(co.getSection()))
                .filter(co -> req.academicTermId() == null || (co.getAcademicTerm() != null && req.academicTermId().equals(co.getAcademicTerm().getId())))
                .collect(Collectors.toList());

        int createdCount = 0;
        List<String> offeringNames = new ArrayList<>();

        for (CourseOffering co : sectionOfferings) {
            String title = co.getSubject().getCode() + " - " + co.getSubject().getName() + " (Sec " + co.getSection() + ")";
            if (!offeringNames.contains(title)) {
                offeringNames.add(title);
            }

            for (StudentProfile s : sectionStudents) {
                boolean alreadyEnrolled = enrollmentRepository.findByCourseOfferingId(co.getId()).stream()
                        .anyMatch(e -> s.getId().equals(e.getStudent().getId()));
                if (!alreadyEnrolled) {
                    Enrollment e = Enrollment.builder()
                            .courseOffering(co)
                            .student(s)
                            .status("ENROLLED")
                            .build();
                    enrollmentRepository.save(e);
                    createdCount++;
                }
            }
        }

        return new AutoEnrollSectionResultDto(
                section,
                sectionStudents.size(),
                createdCount,
                offeringNames
        );
    }
}
