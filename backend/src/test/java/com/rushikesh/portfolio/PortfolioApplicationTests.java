package com.rushikesh.portfolio;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    @LocalServerPort
    private int port;

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
    void adminCanSetExperienceSkills() {
        HttpHeaders headers = adminHeaders();
        String body = """
                {"company":"Test Co","role":"Engineer","duration":"2026","displayOrder":99,
                 "bullets":["Built things"],"skills":["Kafka"," Java ","Kafka"]}""";
        ResponseEntity<String> created = rest.postForEntity("/api/v1/experiences", new HttpEntity<>(body, headers), String.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        // Trimmed, de-duplicated, order kept — and returned by the public API.
        assertThat(created.getBody()).contains("\"skills\":[\"Kafka\",\"Java\"]");
        assertThat(rest.getForEntity("/api/v1/experiences", String.class).getBody()).contains("\"skills\":[\"Kafka\",\"Java\"]");
    }

    @Test
    void adminCanReorderBucketList() {
        HttpHeaders headers = adminHeaders();
        Long first = rest.postForEntity("/api/v1/bucket-list",
                new HttpEntity<>("{\"title\":\"See the northern lights\",\"displayOrder\":1}", headers), BucketItem.class).getBody().id();
        Long second = rest.postForEntity("/api/v1/bucket-list",
                new HttpEntity<>("{\"title\":\"Run a marathon\",\"done\":true,\"completedOn\":\"2026\",\"displayOrder\":2}", headers),
                BucketItem.class).getBody().id();

        ResponseEntity<String> reordered = rest.exchange("/api/v1/bucket-list/order", HttpMethod.PUT,
                new HttpEntity<>("{\"ids\":[" + second + "," + first + "]}", headers), String.class);
        assertThat(reordered.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Public, and in the new order.
        String list = rest.getForEntity("/api/v1/bucket-list", String.class).getBody();
        assertThat(list.indexOf("Run a marathon")).isLessThan(list.indexOf("See the northern lights"));

        // A partial order is rejected rather than leaving duplicate positions.
        ResponseEntity<String> partial = rest.exchange("/api/v1/bucket-list/order", HttpMethod.PUT,
                new HttpEntity<>("{\"ids\":[" + first + "]}", headers), String.class);
        assertThat(partial.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    record BucketItem(Long id) {
    }

    /** Logs in as the seeded admin; returns JSON headers carrying the session cookie. */
    private HttpHeaders adminHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Login and writes need a same-origin Origin or Referer; the JDK HTTP client drops Origin, so use Referer.
        headers.set(HttpHeaders.REFERER, "http://localhost:" + port + "/admin");
        ResponseEntity<String> login = rest.postForEntity("/api/v1/auth/login",
                new HttpEntity<>("{\"username\":\"admin\",\"password\":\"test-admin-password\"}", headers), String.class);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        headers.add(HttpHeaders.COOKIE, login.getHeaders().getFirst(HttpHeaders.SET_COOKIE).split(";", 2)[0]);
        return headers;
    }

    @Test
    void adminEndpointsRequireAuth() {
        ResponseEntity<String> response = rest.getForEntity("/api/v1/auth/me", String.class);
        assertThat(response.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
}
