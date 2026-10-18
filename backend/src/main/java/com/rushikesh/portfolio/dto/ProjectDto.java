package com.rushikesh.portfolio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProjectDto(
        Long id,
        @NotBlank @Size(max = 160) String name,
        @NotBlank String shortDescription,
        String fullDescription,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String githubUrl,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String liveUrl,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String imageUrl,
        int displayOrder,
        @NotNull List<@NotBlank @Size(max = 80) String> tags,
        @NotNull List<@NotBlank String> bullets,
        @Size(max = 20) List<@Valid ProjectImageDto> images
) {
}
