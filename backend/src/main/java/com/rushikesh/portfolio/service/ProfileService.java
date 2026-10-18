package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.ProfileDto;
import com.rushikesh.portfolio.entity.Profile;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository repository;
    private final FileStorageService files;

    public ProfileService(ProfileRepository repository, FileStorageService files) {
        this.repository = repository;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public ProfileDto get() {
        return toDto(load());
    }

    @Transactional
    public ProfileDto update(ProfileDto dto) {
        Profile p = repository.findFirstByOrderByIdAsc().orElseGet(Profile::new);
        files.replaced(p.getResumeUrl(), dto.resumeUrl());
        files.replaced(p.getAvatarUrl(), dto.avatarUrl());
        p.setName(dto.name().trim());
        p.setTitle(dto.title().trim());
        p.setTagline(dto.tagline());
        p.setLocation(dto.location());
        p.setPhone(dto.phone());
        p.setEmail(dto.email());
        p.setSummary(dto.summary());
        p.setSpeechLines(dto.speechLines() == null ? null : String.join("\n",
                dto.speechLines().stream().map(String::trim).filter(s -> !s.isEmpty()).toList()));
        p.setResumeUrl(blankToNull(dto.resumeUrl()));
        p.setAvatarUrl(blankToNull(dto.avatarUrl()));
        p.setHeroCode(dto.heroCode() == null || dto.heroCode().isBlank() ? null : dto.heroCode().replace("\r\n", "\n"));
        return toDto(repository.save(p));
    }

    private Profile load() {
        return repository.findFirstByOrderByIdAsc().orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private ProfileDto toDto(Profile p) {
        List<String> lines = p.getSpeechLines() == null ? List.of()
                : Arrays.stream(p.getSpeechLines().split("\n")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        return new ProfileDto(p.getId(), p.getName(), p.getTitle(), p.getTagline(), p.getLocation(), p.getPhone(),
                p.getEmail(), p.getSummary(), lines, p.getResumeUrl(), p.getAvatarUrl(), p.getHeroCode());
    }
}
