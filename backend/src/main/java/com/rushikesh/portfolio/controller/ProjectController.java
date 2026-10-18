package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.ProjectDto;
import com.rushikesh.portfolio.service.ProjectService;
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
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List all Projects (public)")
    public List<ProjectDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one by id (public)")
    public ProjectDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectDto dto) {
        ProjectDto created = service.create(dto);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri()).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ProjectDto update(@PathVariable Long id, @Valid @RequestBody ProjectDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
