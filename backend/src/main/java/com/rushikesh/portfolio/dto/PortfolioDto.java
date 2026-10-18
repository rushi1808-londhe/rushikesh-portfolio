package com.rushikesh.portfolio.dto;

import java.util.List;

public record PortfolioDto(
        ProfileDto profile,
        List<SocialLinkDto> socialLinks,
        List<SkillDto> skills,
        List<ExperienceDto> experiences,
        List<ProjectDto> projects,
        List<CertificateDto> certificates,
        List<ExtracurricularDto> extracurriculars
) {
}
