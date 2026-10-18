package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.SocialLinkDto;
import com.rushikesh.portfolio.entity.SocialLink;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.SocialLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class SocialLinkService {

    private final SocialLinkRepository repository;

    public SocialLinkService(SocialLinkRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SocialLinkDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SocialLinkDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public SocialLinkDto create(SocialLinkDto dto) {
        SocialLink s = new SocialLink();
        apply(s, dto);
        return toDto(repository.save(s));
    }

    @Transactional
    public SocialLinkDto update(Long id, SocialLinkDto dto) {
        SocialLink s = load(id);
        apply(s, dto);
        return toDto(repository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(load(id));
    }

    private SocialLink load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Social link", id));
    }

    private void apply(SocialLink s, SocialLinkDto dto) {
        s.setPlatform(dto.platform().trim());
        s.setUrl(dto.url().trim());
        String icon = ProfileService.blankToNull(dto.icon());
        s.setIcon(icon == null ? dto.platform().trim().toLowerCase(Locale.ROOT) : icon.toLowerCase(Locale.ROOT));
        s.setDisplayOrder(dto.displayOrder());
    }

    private SocialLinkDto toDto(SocialLink s) {
        return new SocialLinkDto(s.getId(), s.getPlatform(), s.getUrl(), s.getIcon(), s.getDisplayOrder());
    }
}
