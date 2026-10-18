package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.SkillDto;
import com.rushikesh.portfolio.entity.Skill;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository repository;
    private final IconValidator iconValidator;
    private final FileStorageService files;

    public SkillService(SkillRepository repository, IconValidator iconValidator, FileStorageService files) {
        this.repository = repository;
        this.iconValidator = iconValidator;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public List<SkillDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SkillDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public SkillDto create(SkillDto dto) {
        Skill s = new Skill();
        apply(s, dto);
        return toDto(repository.save(s));
    }

    @Transactional
    public SkillDto update(Long id, SkillDto dto) {
        Skill s = load(id);
        files.replaced(s.getIconUrl(), dto.iconUrl());
        apply(s, dto);
        return toDto(repository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        Skill s = load(id);
        repository.delete(s);
        files.deleteIfManaged(s.getIconUrl());
    }

    private Skill load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Skill", id));
    }

    private void apply(Skill s, SkillDto dto) {
        s.setName(dto.name().trim());
        s.setCategory(dto.category().trim());
        s.setDisplayOrder(dto.displayOrder());
        s.setIconData(iconValidator.normalize(dto.iconData()));
        s.setIconUrl(ProfileService.blankToNull(dto.iconUrl()));
    }

    private SkillDto toDto(Skill s) {
        return new SkillDto(s.getId(), s.getName(), s.getCategory(), s.getDisplayOrder(), s.getIconData(), s.getIconUrl());
    }
}
