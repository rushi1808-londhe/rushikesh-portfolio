package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.ProjectDto;
import com.rushikesh.portfolio.entity.Project;
import com.rushikesh.portfolio.entity.ProjectBullet;
import com.rushikesh.portfolio.entity.ProjectImage;
import com.rushikesh.portfolio.entity.ProjectTag;
import com.rushikesh.portfolio.dto.ProjectImageDto;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repository;
    private final FileStorageService files;

    public ProjectService(ProjectRepository repository, FileStorageService files) {
        this.repository = repository;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public ProjectDto create(ProjectDto dto) {
        Project p = new Project();
        apply(p, dto);
        return toDto(repository.save(p));
    }

    @Transactional
    public ProjectDto update(Long id, ProjectDto dto) {
        Project p = load(id);
        files.replaced(p.getImageUrl(), dto.imageUrl());
        // Delete uploaded screenshots that were removed from the project.
        java.util.Set<String> kept = new java.util.HashSet<>();
        if (dto.images() != null) dto.images().forEach(i -> kept.add(i.url()));
        p.getImages().stream().map(ProjectImage::getUrl).filter(u -> !kept.contains(u)).forEach(files::deleteIfManaged);
        apply(p, dto);
        return toDto(repository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        Project p = load(id);
        repository.delete(p);
        files.deleteIfManaged(p.getImageUrl());
        p.getImages().forEach(i -> files.deleteIfManaged(i.getUrl()));
    }

    private Project load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Project", id));
    }

    private void apply(Project p, ProjectDto dto) {
        p.setName(dto.name().trim());
        p.setShortDescription(dto.shortDescription().trim());
        p.setFullDescription(ProfileService.blankToNull(dto.fullDescription()));
        p.setGithubUrl(ProfileService.blankToNull(dto.githubUrl()));
        p.setLiveUrl(ProfileService.blankToNull(dto.liveUrl()));
        p.setImageUrl(ProfileService.blankToNull(dto.imageUrl()));
        p.setDisplayOrder(dto.displayOrder());
        p.replaceTags(dto.tags().stream().map(String::trim).distinct().toList());
        p.replaceBullets(dto.bullets().stream().map(String::trim).toList());
        p.replaceImages(dto.images() == null ? List.of() : dto.images().stream()
                .map(i -> new String[]{i.url().trim(), ProfileService.blankToNull(i.caption())})
                .toList());
    }

    private ProjectDto toDto(Project p) {
        return new ProjectDto(p.getId(), p.getName(), p.getShortDescription(), p.getFullDescription(),
                p.getGithubUrl(), p.getLiveUrl(), p.getImageUrl(), p.getDisplayOrder(),
                p.getTags().stream().map(ProjectTag::getName).toList(),
                p.getBullets().stream().map(ProjectBullet::getContent).toList(),
                p.getImages().stream().map(i -> new ProjectImageDto(i.getUrl(), i.getCaption())).toList());
    }
}
