package com.rushikesh.portfolio.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(
        @NotBlank String username,
        @NotBlank @Size(min = 12, message = "ADMIN_PASSWORD must be at least 12 characters") String password
) {
}
