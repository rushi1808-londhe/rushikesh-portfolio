package com.rushikesh.portfolio.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.rushikesh.portfolio.config.JwtProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/** Revoked token IDs (logout). Entries expire with the token lifetime, so the set stays small. */
@Component
public class TokenDenylist {

    private final Cache<String, Boolean> revoked;

    public TokenDenylist(JwtProperties jwt) {
        this.revoked = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMillis(jwt.expirationMs()))
                .maximumSize(100_000)
                .build();
    }

    public void revoke(String jti) {
        if (jti != null) revoked.put(jti, Boolean.TRUE);
    }

    public boolean isRevoked(String jti) {
        return jti == null || revoked.getIfPresent(jti) != null;
    }
}
