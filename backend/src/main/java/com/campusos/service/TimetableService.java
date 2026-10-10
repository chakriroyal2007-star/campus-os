package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final ClassSessionRepository classSessionRepository;
    private final ClassCancellationRepository cancellationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;

    @Transactional(readOnly = true)
    public TimetableSummaryDto getStudentTimetable(UUID studentUserId, LocalDate date) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        int dayOfWeek = queryDate.getDayOfWeek().getValue(); // 1 = Monday ... 7 = Sunday

        List<ClassSession> sessions = classSessionRepository.findByStudentId(student.getId());

        List<ClassSessionDto> dtoList = sessions.stream()
                .sorted(Comparator.comparing(ClassSession::getStartTime))
                .map(s -> mapSessionToDto(s, queryDate))
                .collect(Collectors.toList());

        List<ClassSessionDto> todaySessions = dtoList.stream()
                .filter(s -> s.dayOfWeek() == dayOfWeek)
                .collect(Collectors.toList());

        LocalTime nowTime = LocalTime.now();
        ClassSessionDto currentSession = null;
        Long secondsRemainingInCurrent = null;
        ClassSessionDto nextSession = null;
        Long secondsUntilNext = null;

        for (ClassSessionDto s : todaySessions) {
            if (s.isCancelled()) continue;

            if (!nowTime.isBefore(s.startTime()) && nowTime.isBefore(s.endTime())) {
                currentSession = s;
                secondsRemainingInCurrent = Duration.between(nowTime, s.endTime()).getSeconds();
            } else if (nowTime.isBefore(s.startTime())) {
                if (nextSession == null || s.startTime().isBefore(nextSession.startTime())) {
                    nextSession = s;
                    secondsUntilNext = Duration.between(nowTime, s.startTime()).getSeconds();
                }
            }
        }

        return new TimetableSummaryDto(
                dtoList,
                currentSession,
                secondsRemainingInCurrent,
                nextSession,
                secondsUntilNext
        );
    }

    @Transactional(readOnly = true)
    public TimetableSummaryDto getTeacherTimetable(UUID teacherUserId, LocalDate date) {
        TeacherProfile teacher = teacherProfileRepository.findByUserId(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user: " + teacherUserId));

        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        int dayOfWeek = queryDate.getDayOfWeek().getValue();

        List<ClassSession> sessions = classSessionRepository.findByTeacherId(teacher.getId());

        List<ClassSessionDto> dtoList = sessions.stream()
                .sorted(Comparator.comparing(ClassSession::getStartTime))
                .map(s -> mapSessionToDto(s, queryDate))
                .collect(Collectors.toList());

        List<ClassSessionDto> todaySessions = dtoList.stream()
                .filter(s -> s.dayOfWeek() == dayOfWeek)
                .collect(Collectors.toList());

        LocalTime nowTime = LocalTime.now();
        ClassSessionDto currentSession = null;
        Long secondsRemainingInCurrent = null;
        ClassSessionDto nextSession = null;
        Long secondsUntilNext = null;

        for (ClassSessionDto s : todaySessions) {
            if (s.isCancelled()) continue;

            if (!nowTime.isBefore(s.startTime()) && nowTime.isBefore(s.endTime())) {
                currentSession = s;
                secondsRemainingInCurrent = Duration.between(nowTime, s.endTime()).getSeconds();
            } else if (nowTime.isBefore(s.startTime())) {
                if (nextSession == null || s.startTime().isBefore(nextSession.startTime())) {
                    nextSession = s;
                    secondsUntilNext = Duration.between(nowTime, s.startTime()).getSeconds();
                }
            }
        }

        return new TimetableSummaryDto(
                dtoList,
                currentSession,
                secondsRemainingInCurrent,
                nextSession,
                secondsUntilNext
        );
    }

    private ClassSessionDto mapSessionToDto(ClassSession s, LocalDate date) {
        Optional<ClassCancellation> cancellation = cancellationRepository.findByClassSessionIdAndCancellationDate(s.getId(), date);

        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByCourseOfferingId(s.getCourseOffering().getId());
        String teacherName = assignments.isEmpty() ? "Unassigned" : assignments.get(0).getTeacher().getUser().getFullName();

        return new ClassSessionDto(
                s.getId(),
                s.getCourseOffering().getId(),
                s.getCourseOffering().getSubject().getCode(),
                s.getCourseOffering().getSubject().getName(),
                s.getCourseOffering().getSection(),
                s.getDayOfWeek(),
                s.getStartTime(),
                s.getEndTime(),
                s.getRoom() != null ? s.getRoom().getRoomNumber() : "TBD",
                s.getRoom() != null ? s.getRoom().getBuilding() : "Main Campus",
                teacherName,
                cancellation.isPresent(),
                cancellation.map(ClassCancellation::getReason).orElse(null)
        );
    }
}
