package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.config.SecurityProperties;
import com.rushikesh.portfolio.dto.LoginRequest;
import com.rushikesh.portfolio.dto.LoginResponse;
import com.rushikesh.portfolio.security.JwtAuthFilter;
import com.rushikesh.portfolio.security.JwtService;
import com.rushikesh.portfolio.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityProperties props;

    public AuthController(AuthService authService, SecurityProperties props) {
        this.authService = authService;
        this.props = props;
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in. The session JWT is set as an HttpOnly, SameSite=Strict cookie")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        JwtService.IssuedToken issued = authService.login(request, http.getRemoteAddr());
        ResponseCookie cookie = sessionCookie(issued.token(), Duration.between(Instant.now(), issued.expiresAt()));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .cacheControl(CacheControl.noStore())
                .body(new LoginResponse(request.username().trim(), issued.expiresAt()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out: revokes the token and clears the cookie")
    public ResponseEntity<Void> logout(HttpServletRequest http) {
        String token = null;
        String header = http.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else if (http.getCookies() != null) {
            for (Cookie c : http.getCookies()) {
                if (props.cookieName().equals(c.getName())) token = c.getValue();
            }
        }
        authService.logout(token, http.getRemoteAddr());
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, sessionCookie("", Duration.ZERO).toString()).build();
    }

    @GetMapping("/me")
    @Operation(summary = "Current admin session", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ResponseEntity<LoginResponse> me(Authentication authentication, HttpServletRequest http) {
        Instant expiresAt = (Instant) http.getAttribute(JwtAuthFilter.EXPIRES_ATTRIBUTE);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new LoginResponse(authentication.getName(), expiresAt));
    }

    private ResponseCookie sessionCookie(String value, Duration maxAge) {
        return ResponseCookie.from(props.cookieName(), value)
                .httpOnly(true)
                .secure(props.cookieSecure())
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
