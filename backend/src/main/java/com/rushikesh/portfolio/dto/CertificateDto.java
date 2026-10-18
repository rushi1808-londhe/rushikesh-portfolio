package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CertificateDto(
        Long id,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 160) String issuer,
        @Size(max = 40) String issueDate,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String credentialUrl,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String imageUrl,
        String description,
        int displayOrder
) {
}
