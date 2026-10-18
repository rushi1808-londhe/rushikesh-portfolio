package com.rushikesh.portfolio.security;

import com.rushikesh.portfolio.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class JwtService {

    private static final String ISSUER = "portfolio-backend";
    private static final String AUDIENCE = "portfolio-admin";

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(JwtProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = properties.expirationMs();
    }

    public record IssuedToken(String token, String jti, Instant expiresAt) {
    }

    public IssuedToken issue(String username, String role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(expirationMs);
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .id(jti)
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject(username)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .notBefore(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
        return new IssuedToken(token, jti, expiresAt);
    }

    /** Verifies signature (HS512 only), issuer, audience and expiry. */
    public Optional<Claims> parse(String token) {
        try {
            return Optional.of(Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(ISSUER)
                    .requireAudience(AUDIENCE)
                    .clockSkewSeconds(30)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
