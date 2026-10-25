package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BucketListItemDto(
        Long id,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        boolean done,
        @Size(max = 40) String completedOn,
        int displayOrder
) {
}
