package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.BucketListItemDto;
import com.rushikesh.portfolio.dto.ReorderRequest;
import com.rushikesh.portfolio.service.BucketListService;
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
@RequestMapping("/api/v1/bucket-list")
@Tag(name = "Bucket list")
public class BucketListController {

    private final BucketListService service;

    public BucketListController(BucketListService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List the bucket list in display order (public)")
    public List<BucketListItemDto> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one by id (public)")
    public BucketListItemDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ResponseEntity<BucketListItemDto> create(@Valid @RequestBody BucketListItemDto dto) {
        BucketListItemDto created = service.create(dto);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri()).body(created);
    }

    @PutMapping("/order")
    @Operation(summary = "Reorder the whole list (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public List<BucketListItemDto> reorder(@Valid @RequestBody ReorderRequest request) {
        return service.reorder(request.ids());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public BucketListItemDto update(@PathVariable Long id, @Valid @RequestBody BucketListItemDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
