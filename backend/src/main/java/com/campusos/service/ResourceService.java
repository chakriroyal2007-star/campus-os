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
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserAccountRepository userRepository;

    @Transactional(readOnly = true)
    public List<ResourceDto> getStudentResources(UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + studentUserId));

        List<Resource> resources = resourceRepository.findPublishedForStudent(student.getId());
        return resources.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResourceDto> getCourseResources(UUID courseOfferingId) {
        List<Resource> resources = resourceRepository.findByCourseOfferingId(courseOfferingId);
        return resources.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ResourceDto createResource(UUID uploaderUserId, CreateResourceRequest req) {
        UserAccount user = userRepository.findById(uploaderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uploaderUserId));

        CourseOffering co = req.courseOfferingId() != null
                ? courseOfferingRepository.findById(req.courseOfferingId()).orElse(null)
                : null;

        Resource resource = Resource.builder()
                .institution(user.getInstitution())
                .courseOffering(co)
                .uploadedBy(user)
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .fileKey(req.fileKey())
                .fileName(req.fileName())
                .fileSizeBytes(req.fileSizeBytes() != null ? req.fileSizeBytes() : 0L)
                .mimeType(req.mimeType())
                .isPublished(req.isPublished())
                .build();

        resource = resourceRepository.save(resource);
        return mapToDto(resource);
    }

    private ResourceDto mapToDto(Resource r) {
        return new ResourceDto(
                r.getId(),
                r.getCourseOffering() != null ? r.getCourseOffering().getId() : null,
                r.getCourseOffering() != null ? r.getCourseOffering().getSubject().getName() : "General",
                r.getTitle(),
                r.getDescription(),
                r.getCategory(),
                r.getFileKey(),
                r.getFileName(),
                r.getFileSizeBytes(),
                r.getMimeType(),
                r.getIsPublished(),
                r.getUploadedBy().getFullName(),
                r.getCreatedAt()
        );
    }
}
