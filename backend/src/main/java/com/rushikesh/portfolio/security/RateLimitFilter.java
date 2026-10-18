package com.rushikesh.portfolio.security;

import com.rushikesh.portfolio.config.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Per-IP rate limits applied before any other processing. Client IPs come from Tomcat's
 * RemoteIpValve, which only trusts X-Forwarded-For from internal proxies (the Nginx container).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimiter limiter;
    private final SecurityProperties props;

    public RateLimitFilter(RateLimiter limiter, SecurityProperties props) {
        this.limiter = limiter;
        this.props = props;
    }

    private record Rule(String name, int capacity, Duration period) {
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator/") || "OPTIONS".equals(request.getMethod());
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        Rule rule = ruleFor(request.getMethod(), request.getRequestURI());
        String ip = request.getRemoteAddr();
        long retryAfter = limiter.tryAcquire(rule.name() + ':' + ip, rule.capacity(), rule.period());
        if (retryAfter > 0) {
            log.warn("Rate limit '{}' exceeded by {} on {} {}", rule.name(), ip, request.getMethod(), request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write("{\"title\":\"Too Many Requests\",\"status\":429,\"detail\":\"Too many requests. Please try again in "
                    + retryAfter + " seconds.\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private Rule ruleFor(String method, String path) {
        boolean write = !("GET".equals(method) || "HEAD".equals(method));
        if (write && "/api/v1/auth/login".equals(path)) {
            return new Rule("login", props.loginPerIpPerWindow(), props.loginWindow());
        }
        if (write && "/api/v1/contact".equals(path)) {
            return new Rule("contact", props.contactPerHour(), Duration.ofHours(1));
        }
        if (write && path.startsWith("/api/v1/files")) {
            return new Rule("upload", props.uploadsPerHour(), Duration.ofHours(1));
        }
        if (write) {
            return new Rule("write", props.apiWritesPerMinute(), Duration.ofMinutes(1));
        }
        return new Rule("read", props.apiReadsPerMinute(), Duration.ofMinutes(1));
    }
}
