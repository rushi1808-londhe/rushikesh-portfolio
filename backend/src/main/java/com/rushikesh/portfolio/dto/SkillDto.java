package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SkillDto(
        Long id,
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 80) String category,
        int displayOrder,
        @Size(max = 60000) String iconData,
        @Size(max = 500) @Pattern(regexp = "^(/uploads/[A-Za-z0-9._-]+)?$", message = "must be an uploaded file URL") String iconUrl
) {
}
