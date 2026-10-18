package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.ContactMessageDto;
import com.rushikesh.portfolio.dto.ContactRequest;
import com.rushikesh.portfolio.entity.ContactMessage;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.ContactMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository repository;

    public ContactService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void submit(ContactRequest request, String clientIp) {
        if (request.website() != null && !request.website().isBlank()) {
            log.info("Contact honeypot triggered from {}", clientIp);
            return; // pretend success so bots don't adapt
        }
        ContactMessage m = new ContactMessage();
        m.setName(request.name().trim());
        m.setEmail(request.email().trim());
        m.setMessage(request.message().trim());
        repository.save(m);
    }

    @Transactional(readOnly = true)
    public List<ContactMessageDto> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public ContactMessageDto setRead(Long id, boolean read) {
        ContactMessage m = repository.findById(id).orElseThrow(() -> new NotFoundException("Message", id));
        m.setRead(read);
        return toDto(m);
    }

    @Transactional
    public void delete(Long id) {
        ContactMessage m = repository.findById(id).orElseThrow(() -> new NotFoundException("Message", id));
        repository.delete(m);
    }

    private ContactMessageDto toDto(ContactMessage m) {
        return new ContactMessageDto(m.getId(), m.getName(), m.getEmail(), m.getMessage(), m.isRead(), m.getCreatedAt());
    }
}
