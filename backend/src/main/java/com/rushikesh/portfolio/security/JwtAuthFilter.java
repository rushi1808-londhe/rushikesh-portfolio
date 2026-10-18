package com.rushikesh.portfolio.security;

import com.rushikesh.portfolio.config.CorsProperties;
import com.rushikesh.portfolio.config.SecurityProperties;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Set;

/**
 * Authenticates admin requests from the HttpOnly session cookie (browser) or a Bearer header
 * (API clients). Cookie-authenticated state-changing requests must come from an allowed origin,
 * which together with SameSite=Strict defeats CSRF.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String EXPIRES_ATTRIBUTE = "auth.expiresAt";
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private static final String BEARER = "Bearer ";
    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    private final JwtService jwtService;
    private final TokenDenylist denylist;
    private final SecurityProperties props;
    private final CorsProperties cors;

    public JwtAuthFilter(JwtService jwtService, TokenDenylist denylist, SecurityProperties props, CorsProperties cors) {
        this.jwtService = jwtService;
        this.denylist = denylist;
        this.props = props;
        this.cors = cors;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        boolean viaHeader = header != null && header.startsWith(BEARER);
        String token = viaHeader ? header.substring(BEARER.length()) : cookieValue(request);
        boolean stateChanging = !SAFE_METHODS.contains(request.getMethod());

        // CSRF: browsers attach cookies automatically, so cookie-authenticated writes (and login itself)
        // must prove they originate from our own pages.
        boolean isLogin = "/api/v1/auth/login".equals(request.getRequestURI());
        if (stateChanging && !viaHeader && (token != null || isLogin) && !sameOrigin(request)) {
            log.warn("Blocked cross-origin {} {} from {} (Origin={}, Referer={})", request.getMethod(), request.getRequestURI(),
                    request.getRemoteAddr(), request.getHeader("Origin"), request.getHeader("Referer"));
            reject(response);
            return;
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            jwtService.parse(token)
                    .filter(claims -> !denylist.isRevoked(claims.getId()))
                    .ifPresent(claims -> authenticate(request, claims));
        }
        chain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, Claims claims) {
        String role = claims.get("role", String.class);
        var auth = new UsernamePasswordAuthenticationToken(claims.getSubject(), claims.getId(),
                List.of(new SimpleGrantedAuthority("ROLE_" + (role == null ? "ADMIN" : role))));
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.setAttribute(EXPIRES_ATTRIBUTE, claims.getExpiration().toInstant());
    }

    private String cookieValue(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (props.cookieName().equals(c.getName()) && !c.getValue().isBlank()) return c.getValue();
        }
        return null;
    }

    /** True when Origin (or, failing that, Referer) matches this host or a configured CORS origin. */
    private boolean sameOrigin(HttpServletRequest request) {
        String source = request.getHeader("Origin");
        if (source == null || source.isBlank() || "null".equals(source)) {
            String referer = request.getHeader("Referer");
            if (referer == null || referer.isBlank()) return false;
            source = referer;
        }
        try {
            URI uri = URI.create(source);
            if (uri.getScheme() == null || uri.getHost() == null) return false;
            String origin = uri.getScheme() + "://" + uri.getHost() + (uri.getPort() == -1 ? "" : ":" + uri.getPort());
            String host = request.getHeader(HttpHeaders.HOST);
            String self = request.getScheme() + "://" + host;
            return origin.equalsIgnoreCase(self)
                    || (host != null && (uri.getHost() + (uri.getPort() == -1 ? "" : ":" + uri.getPort())).equalsIgnoreCase(host))
                    || cors.allowedOrigins().stream().anyMatch(origin::equalsIgnoreCase);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.getWriter().write("{\"title\":\"Forbidden\",\"status\":403,\"detail\":\"Cross-site request blocked\"}");
    }
}
