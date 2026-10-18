package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.ContactMessageDto;
import com.rushikesh.portfolio.dto.ContactRequest;
import com.rushikesh.portfolio.dto.ReadStatusRequest;
import com.rushikesh.portfolio.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contact")
@Tag(name = "Contact")
public class ContactController {

    private final ContactService service;

    public ContactController(ContactService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Submit a contact message (public, rate limited)")
    public void submit(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        service.submit(request, http.getRemoteAddr());
    }

    @GetMapping
    @Operation(summary = "List messages (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public List<ContactMessageDto> list() {
        return service.findAll();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Mark read/unread (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ContactMessageDto setRead(@PathVariable Long id, @RequestBody ReadStatusRequest request) {
        return service.setRead(id, request.read());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete message (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
