package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SocialLinkDto(
        Long id,
        @NotBlank @Size(max = 60) String platform,
        @Pattern(regexp = "^(https?://\\S+|mailto:\\S+)$", message = "must be an http(s) or mailto URL") @NotBlank @Size(max = 500) String url,
        @Size(max = 60) String icon,
        int displayOrder
) {
}
