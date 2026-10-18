package com.rushikesh.portfolio.dto;

import java.time.OffsetDateTime;

public record ContactMessageDto(
        Long id,
        String name,
        String email,
        String message,
        boolean read,
        OffsetDateTime createdAt
) {
}
