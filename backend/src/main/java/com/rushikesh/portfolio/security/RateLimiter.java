package com.rushikesh.portfolio.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * In-memory token-bucket rate limiter keyed by an arbitrary string (usually "rule:clientIp").
 * Buckets are evicted after an hour of inactivity and the map is size-bounded, so a flood of
 * distinct keys cannot exhaust memory.
 */
@Component
public class RateLimiter {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofHours(1))
            .maximumSize(200_000)
            .build();

    /**
     * Consumes one token.
     *
     * @return 0 if allowed, otherwise the number of seconds until a token becomes available
     */
    public long tryAcquire(String key, int capacity, Duration period) {
        Bucket bucket = buckets.get(key, k -> new Bucket(capacity, period));
        return bucket.tryConsume();
    }

    private static final class Bucket {
        private final int capacity;
        private final double refillPerNano;
        private double tokens;
        private long last;

        Bucket(int capacity, Duration period) {
            this.capacity = capacity;
            this.refillPerNano = (double) capacity / period.toNanos();
            this.tokens = capacity;
            this.last = System.nanoTime();
        }

        synchronized long tryConsume() {
            long now = System.nanoTime();
            tokens = Math.min(capacity, tokens + (now - last) * refillPerNano);
            last = now;
            if (tokens >= 1) {
                tokens -= 1;
                return 0;
            }
            double nanosUntilToken = (1 - tokens) / refillPerNano;
            return Math.max(1, (long) Math.ceil(nanosUntilToken / 1_000_000_000d));
        }
    }
}
