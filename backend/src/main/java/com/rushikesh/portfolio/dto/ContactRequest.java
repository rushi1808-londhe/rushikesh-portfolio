package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 5, max = 5000) String message,
        /* Honeypot: hidden from humans, bots tend to fill it in. */
        @Size(max = 200) String website
) {
}
