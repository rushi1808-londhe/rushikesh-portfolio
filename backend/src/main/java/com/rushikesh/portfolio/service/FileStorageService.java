package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.config.StorageProperties;
import com.rushikesh.portfolio.dto.UploadResponse;
import com.rushikesh.portfolio.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    public static final String PUBLIC_PREFIX = "/uploads/";

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private static final Map<String, String> ALLOWED = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif",
            "application/pdf", "pdf"
    );

    private final Path root;
    private final ImageConverter converter;

    public FileStorageService(StorageProperties properties, ImageConverter converter) {
        this.root = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        this.converter = converter;
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create upload directory " + root, e);
        }
    }

    public UploadResponse store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        String contentType = Objects.requireNonNullElse(file.getContentType(), "").toLowerCase();
        String extension = ALLOWED.get(contentType);
        if (extension == null) {
            throw new BadRequestException("Unsupported file type: " + contentType + ". Allowed: JPEG, PNG, WEBP, GIF, PDF");
        }
        String filename = UUID.randomUUID() + "." + extension;
        Path target = root.resolve(filename).normalize();
        try (InputStream in = file.getInputStream()) {
            if (!matchesSignature(file, contentType)) {
                throw new BadRequestException("File content does not match its declared type");
            }
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file", e);
        }
        return new UploadResponse(PUBLIC_PREFIX + filename, filename, contentType, file.getSize(), null);
    }

    /**
     * Stores an image or PDF as a JPEG (PDFs: first page). With {@code keepPdf}, the original PDF is
     * stored too and returned as {@code sourceUrl}.
     */
    public UploadResponse storeAsJpeg(MultipartFile file, boolean keepPdf) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        String contentType = Objects.requireNonNullElse(file.getContentType(), "").toLowerCase();
        if (!ALLOWED.containsKey(contentType)) {
            throw new BadRequestException("Unsupported file type: " + contentType + ". Allowed: JPEG, PNG, WEBP, GIF, PDF");
        }
        try {
            if (!matchesSignature(file, contentType)) {
                throw new BadRequestException("File content does not match its declared type");
            }
            byte[] original = file.getBytes();
            byte[] jpeg = converter.toJpeg(original, contentType);
            String base = UUID.randomUUID().toString();
            Path target = root.resolve(base + ".jpg").normalize();
            Files.write(target, jpeg);
            String sourceUrl = null;
            if (keepPdf && "application/pdf".equals(contentType)) {
                Files.write(root.resolve(base + ".pdf").normalize(), original);
                sourceUrl = PUBLIC_PREFIX + base + ".pdf";
            }
            return new UploadResponse(PUBLIC_PREFIX + base + ".jpg", base + ".jpg", "image/jpeg", jpeg.length, sourceUrl);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file", e);
        }
    }

    /** Deletes a file previously returned by {@link #store}; ignores external URLs. */
    public void deleteIfManaged(String url) {
        if (url == null || !url.startsWith(PUBLIC_PREFIX)) {
            return;
        }
        Path target = root.resolve(url.substring(PUBLIC_PREFIX.length())).normalize();
        if (!target.startsWith(root)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete {}: {}", target, e.getMessage());
        }
    }

    /** Deletes the old file when an entity's URL field is replaced. */
    public void replaced(String oldUrl, String newUrl) {
        if (oldUrl != null && !oldUrl.equals(newUrl)) {
            deleteIfManaged(oldUrl);
        }
    }

    private boolean matchesSignature(MultipartFile file, String contentType) throws IOException {
        byte[] head;
        try (InputStream in = file.getInputStream()) {
            head = in.readNBytes(12);
        }
        return switch (contentType) {
            case "image/jpeg" -> head.length >= 3 && (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF;
            case "image/png" -> head.length >= 4 && (head[0] & 0xFF) == 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G';
            case "image/gif" -> head.length >= 3 && head[0] == 'G' && head[1] == 'I' && head[2] == 'F';
            case "image/webp" -> head.length >= 12 && head[0] == 'R' && head[1] == 'I' && head[8] == 'W' && head[9] == 'E';
            case "application/pdf" -> head.length >= 4 && head[0] == '%' && head[1] == 'P' && head[2] == 'D' && head[3] == 'F';
            default -> true;
        };
    }
}
