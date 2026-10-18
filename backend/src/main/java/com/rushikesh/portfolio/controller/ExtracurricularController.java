package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.ExtracurricularDto;
import com.rushikesh.portfolio.service.ExtracurricularService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/extracurriculars")
@Tag(name = "Extracurriculars")
public class ExtracurricularController {

    private final ExtracurricularService service;

    public ExtracurricularController(ExtracurricularService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List all Extracurriculars (public)")
    public List<ExtracurricularDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one by id (public)")
    public ExtracurricularDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ResponseEntity<ExtracurricularDto> create(@Valid @RequestBody ExtracurricularDto dto) {
        ExtracurricularDto created = service.create(dto);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri()).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ExtracurricularDto update(@PathVariable Long id, @Valid @RequestBody ExtracurricularDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
