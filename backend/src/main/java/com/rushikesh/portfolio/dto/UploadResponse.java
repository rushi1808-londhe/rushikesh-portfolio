package com.rushikesh.portfolio.dto;

/**
 * @param url       the stored file (a JPEG for image uploads)
 * @param sourceUrl the original PDF, when one was uploaded and kept
 */
public record UploadResponse(String url, String filename, String contentType, long size, String sourceUrl) {
}
