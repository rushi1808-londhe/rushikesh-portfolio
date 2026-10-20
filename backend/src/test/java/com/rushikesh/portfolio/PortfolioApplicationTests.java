package com.rushikesh.portfolio;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Boots the full app against a real Postgres: proves the context starts, every Flyway migration
 * applies and matches the JPA entities (ddl-auto=validate), and the public API answers.
 */
@Testcontainers
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "app.jwt.secret=test-secret-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                "app.admin.password=test-admin-password",
                "app.storage.upload-dir=${java.io.tmpdir}/portfolio-test-uploads"
        })
class PortfolioApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private TestRestTemplate rest;

    @Test
    void healthIsUp() {
        ResponseEntity<String> response = rest.getForEntity("/actuator/health", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("UP");
    }

    @Test
    void publicPortfolioLoads() {
        ResponseEntity<String> response = rest.getForEntity("/api/v1/portfolio", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void seededExperienceLogoIsLinkedAndServed() {
        ResponseEntity<String> experiences = rest.getForEntity("/api/v1/experiences", String.class);
        assertThat(experiences.getBody()).contains("\"logoUrl\":\"/uploads/seed-sbfc-logo.jpg\"");

        ResponseEntity<byte[]> logo = rest.getForEntity("/uploads/seed-sbfc-logo.jpg", byte[].class);
        assertThat(logo.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(logo.getBody()).isNotEmpty();
    }

    @Test
    void adminEndpointsRequireAuth() {
        ResponseEntity<String> response = rest.getForEntity("/api/v1/auth/me", String.class);
        assertThat(response.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
}
