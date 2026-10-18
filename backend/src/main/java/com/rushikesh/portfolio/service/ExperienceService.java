package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.ExperienceDto;
import com.rushikesh.portfolio.entity.Experience;
import com.rushikesh.portfolio.entity.ExperienceBullet;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.ExperienceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExperienceService {

    private final ExperienceRepository repository;

    public ExperienceService(ExperienceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ExperienceDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ExperienceDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public ExperienceDto create(ExperienceDto dto) {
        Experience e = new Experience();
        apply(e, dto);
        return toDto(repository.save(e));
    }

    @Transactional
    public ExperienceDto update(Long id, ExperienceDto dto) {
        Experience e = load(id);
        apply(e, dto);
        return toDto(repository.save(e));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(load(id));
    }

    private Experience load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Experience", id));
    }

    private void apply(Experience e, ExperienceDto dto) {
        e.setCompany(dto.company().trim());
        e.setRole(dto.role().trim());
        e.setDuration(dto.duration().trim());
        e.setLocation(ProfileService.blankToNull(dto.location()));
        e.setDisplayOrder(dto.displayOrder());
        e.replaceBullets(dto.bullets().stream().map(String::trim).toList());
    }

    private ExperienceDto toDto(Experience e) {
        return new ExperienceDto(e.getId(), e.getCompany(), e.getRole(), e.getDuration(), e.getLocation(),
                e.getDisplayOrder(), e.getBullets().stream().map(ExperienceBullet::getContent).toList());
    }
}
