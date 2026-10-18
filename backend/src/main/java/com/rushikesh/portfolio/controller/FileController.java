package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.UploadResponse;
import com.rushikesh.portfolio.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "Files")
public class FileController {

    private final FileStorageService storage;

    public FileController(FileStorageService storage) {
        this.storage = storage;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload an image or PDF (admin). Served afterwards at /uploads/{filename}",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        return storage.store(file);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload an image or PDF and store it as a JPEG (PDF: first page) (admin). "
            + "keepPdf=true also stores the original PDF and returns it as sourceUrl",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public UploadResponse uploadImage(@RequestParam("file") MultipartFile file,
                                      @RequestParam(value = "keepPdf", defaultValue = "false") boolean keepPdf) {
        return storage.storeAsJpeg(file, keepPdf);
    }
}
