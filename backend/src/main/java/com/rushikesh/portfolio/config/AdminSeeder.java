package com.rushikesh.portfolio.config;

import com.rushikesh.portfolio.entity.AdminUser;
import com.rushikesh.portfolio.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the admin account from environment variables, and keeps its password in sync with
 * ADMIN_PASSWORD so rotating the password only requires changing .env and restarting.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    public AdminSeeder(AdminUserRepository repository, PasswordEncoder passwordEncoder, AdminProperties adminProperties) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.adminProperties = adminProperties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AdminUser admin = repository.findByUsername(adminProperties.username()).orElseGet(AdminUser::new);
        boolean isNew = admin.getId() == null;
        if (isNew || !passwordEncoder.matches(adminProperties.password(), admin.getPasswordHash())) {
            admin.setUsername(adminProperties.username());
            admin.setPasswordHash(passwordEncoder.encode(adminProperties.password()));
            admin.setRole("ADMIN");
            repository.save(admin);
            log.info("Admin user '{}' {}", adminProperties.username(), isNew ? "created" : "password updated");
        }
    }
}
