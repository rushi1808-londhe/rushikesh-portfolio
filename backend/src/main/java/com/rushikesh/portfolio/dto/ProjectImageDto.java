package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProjectImageDto(
        @NotBlank @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)$", message = "must be an http(s) URL or an uploaded file")
        @Size(max = 500) String url,
        @Size(max = 160) String caption
) {
}
