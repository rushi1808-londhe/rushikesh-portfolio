package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.CertificateDto;
import com.rushikesh.portfolio.entity.Certificate;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.rushikesh.portfolio.service.ProfileService.blankToNull;

@Service
public class CertificateService {

    private final CertificateRepository repository;
    private final FileStorageService files;

    public CertificateService(CertificateRepository repository, FileStorageService files) {
        this.repository = repository;
        this.files = files;
    }

    @Transactional(readOnly = true)
    public List<CertificateDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public CertificateDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public CertificateDto create(CertificateDto dto) {
        Certificate c = new Certificate();
        apply(c, dto);
        return toDto(repository.save(c));
    }

    @Transactional
    public CertificateDto update(Long id, CertificateDto dto) {
        Certificate c = load(id);
        files.replaced(c.getImageUrl(), dto.imageUrl());
        files.replaced(c.getCredentialUrl(), dto.credentialUrl());
        apply(c, dto);
        return toDto(repository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Certificate c = load(id);
        repository.delete(c);
        files.deleteIfManaged(c.getImageUrl());
        files.deleteIfManaged(c.getCredentialUrl());
    }

    private Certificate load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Certificate", id));
    }

    private void apply(Certificate c, CertificateDto dto) {
        c.setTitle(dto.title().trim());
        c.setIssuer(blankToNull(dto.issuer()));
        c.setIssueDate(blankToNull(dto.issueDate()));
        c.setCredentialUrl(blankToNull(dto.credentialUrl()));
        c.setImageUrl(blankToNull(dto.imageUrl()));
        c.setDescription(blankToNull(dto.description()));
        c.setDisplayOrder(dto.displayOrder());
    }

    private CertificateDto toDto(Certificate c) {
        return new CertificateDto(c.getId(), c.getTitle(), c.getIssuer(), c.getIssueDate(), c.getCredentialUrl(),
                c.getImageUrl(), c.getDescription(), c.getDisplayOrder());
    }
}
