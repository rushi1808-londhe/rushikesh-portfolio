package com.rushikesh.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Tunables for the admin hardening. Defaults are deliberately strict.
 *
 * @param cookieName          name of the HttpOnly session cookie carrying the JWT
 * @param cookieSecure        send the cookie only over HTTPS (enable in production)
 * @param maxFailedAttempts   failed logins before the account is locked
 * @param lockDuration        how long the account stays locked
 * @param loginPerIpPerWindow login attempts allowed per IP per {@code loginWindow}
 * @param loginWindow         window for the per-IP login limit
 * @param apiReadsPerMinute   public GET requests per IP per minute
 * @param apiWritesPerMinute  authenticated write requests per IP per minute
 * @param contactPerHour      contact-form submissions per IP per hour
 * @param uploadsPerHour      file uploads per IP per hour
 */
@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String cookieName,
        boolean cookieSecure,
        int maxFailedAttempts,
        Duration lockDuration,
        int loginPerIpPerWindow,
        Duration loginWindow,
        int apiReadsPerMinute,
        int apiWritesPerMinute,
        int contactPerHour,
        int uploadsPerHour
) {
    public SecurityProperties {
        cookieName = cookieName == null || cookieName.isBlank() ? "portfolio_session" : cookieName;
        maxFailedAttempts = maxFailedAttempts <= 0 ? 5 : maxFailedAttempts;
        lockDuration = lockDuration == null ? Duration.ofMinutes(15) : lockDuration;
        loginPerIpPerWindow = loginPerIpPerWindow <= 0 ? 10 : loginPerIpPerWindow;
        loginWindow = loginWindow == null ? Duration.ofMinutes(15) : loginWindow;
        apiReadsPerMinute = apiReadsPerMinute <= 0 ? 300 : apiReadsPerMinute;
        apiWritesPerMinute = apiWritesPerMinute <= 0 ? 60 : apiWritesPerMinute;
        contactPerHour = contactPerHour <= 0 ? 5 : contactPerHour;
        uploadsPerHour = uploadsPerHour <= 0 ? 30 : uploadsPerHour;
    }
}
