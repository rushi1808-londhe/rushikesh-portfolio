package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.PortfolioDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortfolioService {

    private final ProfileService profileService;
    private final SocialLinkService socialLinkService;
    private final SkillService skillService;
    private final ExperienceService experienceService;
    private final ProjectService projectService;
    private final CertificateService certificateService;
    private final ExtracurricularService extracurricularService;

    public PortfolioService(ProfileService profileService, SocialLinkService socialLinkService,
                            SkillService skillService, ExperienceService experienceService,
                            ProjectService projectService, CertificateService certificateService,
                            ExtracurricularService extracurricularService) {
        this.profileService = profileService;
        this.socialLinkService = socialLinkService;
        this.skillService = skillService;
        this.experienceService = experienceService;
        this.projectService = projectService;
        this.certificateService = certificateService;
        this.extracurricularService = extracurricularService;
    }

    @Transactional(readOnly = true)
    public PortfolioDto getAll() {
        return new PortfolioDto(
                profileService.get(),
                socialLinkService.findAll(),
                skillService.findAll(),
                experienceService.findAll(),
                projectService.findAll(),
                certificateService.findAll(),
                extracurricularService.findAll());
    }
}
