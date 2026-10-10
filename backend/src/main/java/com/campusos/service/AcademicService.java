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
public class AcademicService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    @Transactional(readOnly = true)
    public List<CourseOfferingDto> getStudentCourses(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        List<CourseOffering> offerings = courseOfferingRepository.findByStudentId(student.getId());
        return offerings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseOfferingDto> getTeacherCourses(UUID teacherUserId) {
        TeacherProfile teacher = teacherProfileRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user: " + teacherUserId));

        List<CourseOffering> offerings = courseOfferingRepository.findByTeacherId(teacher.getId());
        return offerings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseOfferingDto getCourseById(UUID courseOfferingId) {
        CourseOffering offering = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found: " + courseOfferingId));
        return mapToDto(offering);
    }

    private CourseOfferingDto mapToDto(CourseOffering co) {
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByCourseOfferingId(co.getId());
        String teacherName = "Unassigned";
        UUID teacherId = null;
        if (!assignments.isEmpty()) {
            TeacherProfile prof = assignments.get(0).getTeacher();
            teacherName = prof.getUser().getFullName();
            teacherId = prof.getId();
        }

        return new CourseOfferingDto(
                co.getId(),
                co.getSubject().getId(),
                co.getSubject().getCode(),
                co.getSubject().getName(),
                co.getSubject().getCredits(),
                co.getSubject().getDescription(),
                co.getAcademicTerm().getId(),
                co.getAcademicTerm().getName(),
                co.getSection(),
                teacherName,
                teacherId
        );
    }
}
