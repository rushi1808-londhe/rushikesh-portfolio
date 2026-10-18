package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.LoginRequest;
import com.rushikesh.portfolio.entity.AdminUser;
import com.rushikesh.portfolio.exception.TooManyRequestsException;
import com.rushikesh.portfolio.repository.AdminUserRepository;
import com.rushikesh.portfolio.security.JwtService;
import com.rushikesh.portfolio.security.LoginAttemptService;
import com.rushikesh.portfolio.security.TokenDenylist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger audit = LoggerFactory.getLogger("AUDIT");

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService attempts;
    private final TokenDenylist denylist;
    /** Compared against when the username is unknown, so timing doesn't reveal valid usernames. */
    private final String dummyHash;

    public AuthService(AdminUserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       LoginAttemptService attempts, TokenDenylist denylist) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.attempts = attempts;
        this.denylist = denylist;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class, TooManyRequestsException.class})
    public JwtService.IssuedToken login(LoginRequest request, String clientIp) {
        String username = request.username().trim();
        Optional<AdminUser> found = repository.findByUsername(username);

        // Persisted lock survives restarts; in-memory lock also covers unknown usernames.
        found.map(AdminUser::getLockedUntil)
                .filter(until -> until.isAfter(OffsetDateTime.now()))
                .ifPresent(until -> attempts.lockUntil(username, until.toInstant()));
        long locked = attempts.lockedSeconds(username);
        if (locked > 0) {
            audit.warn("LOGIN_BLOCKED user='{}' ip={} reason=locked remaining={}s", sanitize(username), clientIp, locked);
            throw new TooManyRequestsException("Too many failed attempts. Try again in " + Math.max(1, locked / 60) + " minute(s).", locked);
        }

        boolean valid = passwordEncoder.matches(request.password(), found.map(AdminUser::getPasswordHash).orElse(dummyHash));
        if (!valid || found.isEmpty()) {
            Instant lockedUntil = attempts.recordFailure(username);
            found.ifPresent(user -> {
                user.setFailedAttempts(user.getFailedAttempts() + 1);
                if (lockedUntil != null) {
                    user.setLockedUntil(OffsetDateTime.ofInstant(lockedUntil, ZoneOffset.UTC));
                    user.setFailedAttempts(0);
                }
            });
            audit.warn("LOGIN_FAILED user='{}' ip={}{}", sanitize(username), clientIp, lockedUntil != null ? " -> account locked" : "");
            throw new BadCredentialsException("Invalid credentials");
        }

        AdminUser user = found.get();
        attempts.recordSuccess(username);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(OffsetDateTime.now());
        user.setLastLoginIp(clientIp);
        audit.info("LOGIN_SUCCESS user='{}' ip={}", sanitize(username), clientIp);
        return jwtService.issue(user.getUsername(), user.getRole());
    }

    public void logout(String token, String clientIp) {
        if (token == null) return;
        jwtService.parse(token).ifPresent(claims -> {
            denylist.revoke(claims.getId());
            audit.info("LOGOUT user='{}' ip={}", sanitize(claims.getSubject()), clientIp);
        });
    }

    /** Prevents log injection via CR/LF in user-supplied usernames. */
    private static String sanitize(String value) {
        String v = value == null ? "" : value.replaceAll("[\\r\\n\\t]", "_");
        return v.length() > 80 ? v.substring(0, 80) + "…" : v;
    }
}
