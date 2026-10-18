package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProfileDto(
        Long id,
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 160) String title,
        @Size(max = 255) String tagline,
        @Size(max = 160) String location,
        @Size(max = 40) String phone,
        @Email @Size(max = 160) String email,
        String summary,
        List<@Size(max = 300) String> speechLines,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String resumeUrl,
        @Pattern(regexp = "^(https?://\\S+|/uploads/[A-Za-z0-9._-]+)?$", message = "must be an http(s) URL or an uploaded file") @Size(max = 500) String avatarUrl,
        @Size(max = 6000) String heroCode
) {
}
