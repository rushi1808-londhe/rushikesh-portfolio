package com.rushikesh.portfolio.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.rushikesh.portfolio.config.SecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

/**
 * Tracks failed logins per username — including usernames that don't exist — so lockout behaviour
 * can't be used to discover valid accounts.
 */
@Component
public class LoginAttemptService {

    private final SecurityProperties props;
    private final Cache<String, State> states;

    public LoginAttemptService(SecurityProperties props) {
        this.props = props;
        this.states = Caffeine.newBuilder()
                .expireAfterAccess(props.lockDuration().plus(Duration.ofHours(1)))
                .maximumSize(100_000)
                .build();
    }

    private static final class State {
        int failures;
        Instant lockedUntil;
    }

    private static String key(String username) {
        return username.trim().toLowerCase(Locale.ROOT);
    }

    /** Seconds remaining on a lock, or 0 if the username may attempt a login. */
    public long lockedSeconds(String username) {
        State s = states.getIfPresent(key(username));
        if (s == null || s.lockedUntil == null) return 0;
        long left = Duration.between(Instant.now(), s.lockedUntil).toSeconds();
        return Math.max(0, left);
    }

    /** Records a failure; returns the lock expiry if this failure triggered a lock. */
    public synchronized Instant recordFailure(String username) {
        State s = states.get(key(username), k -> new State());
        if (s.lockedUntil != null && s.lockedUntil.isBefore(Instant.now())) {
            s.lockedUntil = null;
            s.failures = 0;
        }
        s.failures++;
        if (s.failures >= props.maxFailedAttempts()) {
            s.lockedUntil = Instant.now().plus(props.lockDuration());
            s.failures = 0;
            return s.lockedUntil;
        }
        return null;
    }

    public void lockUntil(String username, Instant until) {
        State s = states.get(key(username), k -> new State());
        s.lockedUntil = until;
    }

    public void recordSuccess(String username) {
        states.invalidate(key(username));
    }
}
