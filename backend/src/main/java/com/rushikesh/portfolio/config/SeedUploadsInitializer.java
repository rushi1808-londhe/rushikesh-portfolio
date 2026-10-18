package com.rushikesh.portfolio.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Copies bundled seed images (classpath:seed-uploads/*.jpg, e.g. project screenshots referenced by
 * Flyway seed data) into the uploads volume when they're missing, so a fresh deployment is complete.
 */
@Component
public class SeedUploadsInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedUploadsInitializer.class);

    private final Path root;

    public SeedUploadsInitializer(StorageProperties storage) {
        this.root = Path.of(storage.uploadDir()).toAbsolutePath().normalize();
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        Resource[] seeds = new PathMatchingResourcePatternResolver().getResources("classpath:seed-uploads/*.jpg");
        Files.createDirectories(root);
        int copied = 0;
        for (Resource seed : seeds) {
            String name = seed.getFilename();
            if (name == null || !name.matches("[A-Za-z0-9._-]+")) continue;
            Path target = root.resolve(name).normalize();
            if (!target.startsWith(root) || Files.exists(target)) continue;
            try (InputStream in = seed.getInputStream()) {
                Files.copy(in, target);
                copied++;
            }
        }
        if (copied > 0) log.info("Copied {} seed image(s) into {}", copied, root);
    }
}
