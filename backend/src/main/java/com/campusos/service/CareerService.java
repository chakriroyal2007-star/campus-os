package com.campusos.service;

import com.campusos.domain.*;
import com.campusos.dto.AppDtos.*;
import com.campusos.exception.ResourceNotFoundException;
import com.campusos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerService {

    private final OpportunityRepository opportunityRepository;
    private final SavedOpportunityRepository savedOpportunityRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserAccountRepository userRepository;

    @Transactional(readOnly = true)
    public List<OpportunityDto> getOpportunities(UUID userId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Opportunity> opps = opportunityRepository.findByInstitutionIdOrderByCreatedAtDesc(user.getInstitution().getId());
        Set<UUID> savedIds = savedOpportunityRepository.findByUserId(userId)
                .stream().map(s -> s.getOpportunity().getId()).collect(Collectors.toSet());

        return opps.stream().map(o -> new OpportunityDto(
                o.getId(),
                o.getTitle(),
                o.getCompanyOrOrganizer(),
                o.getType(),
                o.getLocation(),
                o.getDeadline(),
                o.getDescription(),
                o.getApplyUrl(),
                o.getVerified(),
                savedIds.contains(o.getId()),
                o.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @Transactional
    public OpportunityDto createOpportunity(UUID userId, CreateOpportunityRequest req) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Opportunity opp = Opportunity.builder()
                .institution(user.getInstitution())
                .createdBy(user)
                .title(req.title())
                .companyOrOrganizer(req.companyOrOrganizer())
                .type(req.type())
                .location(req.location())
                .deadline(req.deadline())
                .description(req.description())
                .applyUrl(req.applyUrl())
                .verified(true)
                .build();

        opp = opportunityRepository.save(opp);

        return new OpportunityDto(
                opp.getId(),
                opp.getTitle(),
                opp.getCompanyOrOrganizer(),
                opp.getType(),
                opp.getLocation(),
                opp.getDeadline(),
                opp.getDescription(),
                opp.getApplyUrl(),
                opp.getVerified(),
                false,
                opp.getCreatedAt()
        );
    }

    @Transactional
    public void toggleSaveOpportunity(UUID userId, UUID opportunityId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));

        Optional<SavedOpportunity> existing = savedOpportunityRepository.findByUserIdAndOpportunityId(userId, opportunityId);
        if (existing.isPresent()) {
            savedOpportunityRepository.delete(existing.get());
        } else {
            SavedOpportunity saved = SavedOpportunity.builder()
                    .user(user)
                    .opportunity(opp)
                    .build();
            savedOpportunityRepository.save(saved);
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjects(UUID userId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Project> projects = projectRepository.findByInstitutionIdOrderByCreatedAtDesc(user.getInstitution().getId());
        return projects.stream().map(this::mapProjectToDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto createProject(UUID userId, CreateProjectRequest req) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Project project = Project.builder()
                .institution(user.getInstitution())
                .createdBy(user)
                .title(req.title())
                .description(req.description())
                .skillsTags(req.skillsTags())
                .githubUrl(req.githubUrl())
                .demoUrl(req.demoUrl())
                .isPublic(true)
                .build();

        project = projectRepository.save(project);

        ProjectMember owner = ProjectMember.builder()
                .project(project)
                .user(user)
                .role("OWNER")
                .build();
        projectMemberRepository.save(owner);
        project.getMembers().add(owner);

        return mapProjectToDto(project);
    }

    private ProjectDto mapProjectToDto(Project p) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(p.getId());
        List<ProjectMemberDto> mDtos = members.stream().map(m -> new ProjectMemberDto(
                m.getUser().getId(),
                m.getUser().getFullName(),
                m.getRole(),
                m.getJoinedAt()
        )).collect(Collectors.toList());

        return new ProjectDto(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getSkillsTags(),
                p.getGithubUrl(),
                p.getDemoUrl(),
                p.getCreatedBy().getFullName(),
                p.getCreatedBy().getId(),
                mDtos,
                p.getCreatedAt()
        );
    }
}
