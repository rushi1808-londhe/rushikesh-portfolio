package com.rushikesh.portfolio.dto;

import java.time.Instant;

/** The JWT itself is only ever sent as an HttpOnly cookie, never in the response body. */
public record LoginResponse(String username, Instant expiresAt) {
}
