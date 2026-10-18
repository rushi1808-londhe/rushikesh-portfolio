package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.ExtracurricularDto;
import com.rushikesh.portfolio.entity.Extracurricular;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.ExtracurricularRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.rushikesh.portfolio.service.ProfileService.blankToNull;

@Service
public class ExtracurricularService {

    private final ExtracurricularRepository repository;
    private final FileStorageService files;

    public ExtracurricularService(ExtracurricularRepository repository, FileStorageService files) {
        this.repository = repository;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public List<ExtracurricularDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ExtracurricularDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public ExtracurricularDto create(ExtracurricularDto dto) {
        Extracurricular x = new Extracurricular();
        apply(x, dto);
        return toDto(repository.save(x));
    }

    @Transactional
    public ExtracurricularDto update(Long id, ExtracurricularDto dto) {
        Extracurricular x = load(id);
        files.replaced(x.getImageUrl(), dto.imageUrl());
        apply(x, dto);
        return toDto(repository.save(x));
    }

    @Transactional
    public void delete(Long id) {
        Extracurricular x = load(id);
        repository.delete(x);
        files.deleteIfManaged(x.getImageUrl());
    }

    private Extracurricular load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Extracurricular", id));
    }

    private void apply(Extracurricular x, ExtracurricularDto dto) {
        x.setTitle(dto.title().trim());
        x.setDescription(blankToNull(dto.description()));
        x.setImageUrl(blankToNull(dto.imageUrl()));
        x.setEventDate(blankToNull(dto.eventDate()));
        x.setDisplayOrder(dto.displayOrder());
    }

    private ExtracurricularDto toDto(Extracurricular x) {
        return new ExtracurricularDto(x.getId(), x.getTitle(), x.getDescription(), x.getImageUrl(),
                x.getEventDate(), x.getDisplayOrder());
    }
}
