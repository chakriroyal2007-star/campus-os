package com.campusos.service;

import com.campusos.config.JwtTokenProvider;
import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.BadRequestException;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String code = req.institutionCode() != null && !req.institutionCode().trim().isBlank()
                ? req.institutionCode().trim().toUpperCase()
                : "INST001";

        Institution inst = institutionRepository.findByCodeIgnoreCase(code)
                .orElseGet(() -> {
                    // Automatically provision institution if code is new (e.g. pilot "INST001" or custom)
                    Institution newInst = Institution.builder()
                            .code(code)
                            .name(code + " University")
                            .domain(code.toLowerCase() + ".edu")
                            .build();
                    return institutionRepository.save(newInst);
                });

        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByInstitutionIdAndEmailIgnoreCase(inst.getId(), normalizedEmail)) {
            throw new BadRequestException("An account with email " + req.email() + " already exists in this institution.");
        }

        UserAccount user = UserAccount.builder()
                .institution(inst)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(req.password()))
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .phoneNumber(req.phoneNumber())
                .isActive(true)
                .build();

        String roleName = req.role().startsWith("ROLE_") ? req.role() : "ROLE_" + req.role();
        if (!"ROLE_STUDENT".equals(roleName) && !"ROLE_TEACHER".equals(roleName)) {
            throw new BadRequestException("Public registration only allows STUDENT or TEACHER roles. Administrator accounts must be provisioned securely.");
        }
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(roleName)
                .build();
        user.getRoles().add(userRole);

        user = userRepository.save(user);

        UUID studentProfId = null;
        UUID teacherProfId = null;
        String deptName = null;
        String progName = null;

        Department dept = req.departmentId() != null ? departmentRepository.findById(req.departmentId()).orElse(null) : null;
        Program prog = req.programId() != null ? programRepository.findById(req.programId()).orElse(null) : null;
        if (dept != null) deptName = dept.getName();
        if (prog != null) progName = prog.getName();

        if ("ROLE_STUDENT".equals(roleName)) {
            String roll = req.studentIdNumber() != null && !req.studentIdNumber().trim().isBlank()
                    ? req.studentIdNumber().trim()
                    : "STU-" + System.currentTimeMillis() % 100000;
            String sec = req.section() != null && !req.section().trim().isBlank() ? req.section().trim().toUpperCase() : "A";

            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .institution(inst)
                    .department(dept)
                    .program(prog)
                    .studentIdNumber(roll)
                    .batchYear(req.batchYear() != null ? req.batchYear() : 2026)
                    .currentSemester(req.currentSemester() != null ? req.currentSemester() : 1)
                    .section(sec)
                    .enrollmentStatus("ACTIVE")
                    .build();
            final StudentProfile savedStudentProfile = studentProfileRepository.save(profile);
            studentProfId = savedStudentProfile.getId();

            // Auto-enroll registered student into matching active section course offerings
            List<CourseOffering> matchingOfferings = courseOfferingRepository.findAll().stream()
                    .filter(co -> inst.getId().equals(co.getInstitution().getId()))
                    .filter(co -> sec.equalsIgnoreCase(co.getSection()))
                    .collect(Collectors.toList());
            for (CourseOffering co : matchingOfferings) {
                boolean alreadyEnrolled = enrollmentRepository.findByCourseOfferingId(co.getId()).stream()
                        .anyMatch(e -> savedStudentProfile.getId().equals(e.getStudent().getId()));
                if (!alreadyEnrolled) {
                    Enrollment e = Enrollment.builder()
                            .courseOffering(co)
                            .student(savedStudentProfile)
                            .status("ENROLLED")
                            .build();
                    enrollmentRepository.save(e);
                }
            }
        } else if ("ROLE_TEACHER".equals(roleName)) {
            String facultyId = req.facultyIdNumber() != null && !req.facultyIdNumber().trim().isBlank()
                    ? req.facultyIdNumber().trim()
                    : "FAC-" + System.currentTimeMillis() % 100000;
            TeacherProfile profile = TeacherProfile.builder()
                    .user(user)
                    .institution(inst)
                    .department(dept)
                    .facultyIdNumber(facultyId)
                    .designation(req.designation() != null ? req.designation() : "Assistant Professor")
                    .employmentStatus("ACTIVE")
                    .build();
            profile = teacherProfileRepository.save(profile);
            teacherProfId = profile.getId();
        }

        List<String> roleStrings = Collections.singletonList(roleName);
        String token = tokenProvider.generateToken(user.getId(), inst.getId(), user.getEmail(), roleStrings);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .institutionId(inst.getId())
                .institutionName(inst.getName())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roleStrings)
                .studentProfileId(studentProfId)
                .teacherProfileId(teacherProfId)
                .studentIdNumber(req.studentIdNumber())
                .facultyIdNumber(req.facultyIdNumber())
                .departmentName(deptName)
                .programName(progName)
                .currentSemester(req.currentSemester())
                .section(req.section())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null) {
            throw new BadRequestException("Invalid email or password");
        }

        String normalizedEmail = req.email().trim().toLowerCase();
        UserAccount user = null;

        if (req.institutionCode() != null && !req.institutionCode().trim().isBlank()) {
            String instCode = req.institutionCode().trim();
            Optional<Institution> instOpt = institutionRepository.findByCodeIgnoreCase(instCode);
            if (instOpt.isPresent()) {
                user = userRepository.findByInstitutionIdAndEmailIgnoreCase(instOpt.get().getId(), normalizedEmail).orElse(null);
            }
        }

        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        }

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("This account is currently inactive. Contact your institution administrator.");
        }

        List<String> roles = user.getRoles().stream().map(UserRole::getRole).collect(Collectors.toList());
        String token = tokenProvider.generateToken(user.getId(), user.getInstitution().getId(), user.getEmail(), roles);

        StudentProfile sProf = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        TeacherProfile tProf = teacherProfileRepository.findByUserId(user.getId()).orElse(null);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .institutionId(user.getInstitution().getId())
                .institutionName(user.getInstitution().getName())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .studentProfileId(sProf != null ? sProf.getId() : null)
                .teacherProfileId(tProf != null ? tProf.getId() : null)
                .studentIdNumber(sProf != null ? sProf.getStudentIdNumber() : null)
                .facultyIdNumber(tProf != null ? tProf.getFacultyIdNumber() : null)
                .departmentName(sProf != null && sProf.getDepartment() != null ? sProf.getDepartment().getName() : (tProf != null && tProf.getDepartment() != null ? tProf.getDepartment().getName() : null))
                .programName(sProf != null && sProf.getProgram() != null ? sProf.getProgram().getName() : null)
                .currentSemester(sProf != null ? sProf.getCurrentSemester() : null)
                .section(sProf != null ? sProf.getSection() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        StudentProfile sProf = studentProfileRepository.findByUserId(userId).orElse(null);
        TeacherProfile tProf = teacherProfileRepository.findByUserId(userId).orElse(null);

        StudentSummaryDto sDto = null;
        if (sProf != null) {
            sDto = new StudentSummaryDto(
                    sProf.getId(),
                    sProf.getStudentIdNumber(),
                    sProf.getBatchYear(),
                    sProf.getCurrentSemester(),
                    sProf.getSection(),
                    sProf.getEnrollmentStatus(),
                    sProf.getDepartment() != null ? sProf.getDepartment().getName() : null,
                    sProf.getProgram() != null ? sProf.getProgram().getName() : null
            );
        }

        TeacherSummaryDto tDto = null;
        if (tProf != null) {
            tDto = new TeacherSummaryDto(
                    tProf.getId(),
                    tProf.getFacultyIdNumber(),
                    tProf.getDesignation(),
                    tProf.getEmploymentStatus(),
                    tProf.getDepartment() != null ? tProf.getDepartment().getName() : null
            );
        }

        return new UserProfileDto(
                user.getId(),
                user.getInstitution().getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRoles().stream().map(UserRole::getRole).collect(Collectors.toList()),
                sDto,
                tDto
        );
    }

    @Transactional
    public AuthResponse bootstrapCollegeAdmin(BootstrapAdminRequest req) {
        String code = req.institutionCode() != null && !req.institutionCode().trim().isBlank()
                ? req.institutionCode().trim().toUpperCase()
                : "INST001";

        Institution inst = institutionRepository.findByCodeIgnoreCase(code)
                .orElseGet(() -> {
                    Institution newInst = Institution.builder()
                            .code(code)
                            .name(req.institutionName() != null && !req.institutionName().trim().isBlank()
                                    ? req.institutionName().trim()
                                    : code + " College")
                            .domain(code.toLowerCase() + ".edu")
                            .timezone(req.timezone() != null && !req.timezone().trim().isBlank() ? req.timezone().trim() : "Asia/Kolkata")
                            .build();
                    return institutionRepository.save(newInst);
                });

        String normalizedEmail = req.adminEmail().trim().toLowerCase();
        UserAccount user = userRepository.findByInstitutionIdAndEmailIgnoreCase(inst.getId(), normalizedEmail)
                .orElseGet(() -> {
                    UserAccount newUser = UserAccount.builder()
                            .institution(inst)
                            .email(normalizedEmail)
                            .passwordHash(passwordEncoder.encode(req.adminPassword()))
                            .firstName(req.firstName() != null ? req.firstName().trim() : "Admin")
                            .lastName(req.lastName() != null ? req.lastName().trim() : "User")
                            .isActive(true)
                            .build();
                    return userRepository.save(newUser);
                });

        // Ensure user has ROLE_COLLEGE_ADMIN
        boolean hasAdminRole = user.getRoles().stream()
                .anyMatch(r -> "ROLE_COLLEGE_ADMIN".equals(r.getRole()) || "ROLE_ADMIN".equals(r.getRole()) || "ROLE_SUPER_ADMIN".equals(r.getRole()));
        if (!hasAdminRole) {
            UserRole adminRole = UserRole.builder()
                    .user(user)
                    .role("ROLE_COLLEGE_ADMIN")
                    .build();
            user.getRoles().add(adminRole);
            userRepository.save(user);
        }

        List<String> roles = user.getRoles().stream().map(UserRole::getRole).collect(Collectors.toList());
        String token = tokenProvider.generateToken(user.getId(), inst.getId(), user.getEmail(), roles);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .institutionId(inst.getId())
                .institutionName(inst.getName())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .build();
    }
}
