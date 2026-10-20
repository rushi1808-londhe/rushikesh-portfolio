package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ExperienceDto(
        Long id,
        @NotBlank @Size(max = 160) String company,
        @NotBlank @Size(max = 160) String role,
        @NotBlank @Size(max = 80) String duration,
        @Size(max = 160) String location,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String logoUrl,
        int displayOrder,
        @NotNull List<@NotBlank String> bullets
) {
}
