package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Component;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

/**
 * Converts uploaded images and PDFs (first page) to JPEG.
 *
 * Re-encoding also strips metadata (EXIF/GPS) and destroys polyglot payloads. Guards against
 * decompression bombs by checking dimensions before decoding and subsampling oversized images.
 */
@Component
public class ImageConverter {

    /** Longest side of the generated JPEG. */
    private static final int MAX_SIDE = 2400;
    /** Refuse to decode anything larger than this many source pixels. */
    private static final long MAX_SOURCE_PIXELS = 100_000_000L;
    private static final float PDF_MAX_DPI = 200f;
    private static final float QUALITY = 0.88f;

    @PostConstruct
    void init() {
        // Register TwelveMonkeys readers (WebP, CMYK JPEG) from the Spring Boot fat jar; avoid disk cache.
        ImageIO.scanForPlugins();
        ImageIO.setUseCache(false);
    }

    public byte[] toJpeg(byte[] data, String contentType) {
        try {
            BufferedImage source = "application/pdf".equals(contentType) ? renderPdfFirstPage(data) : readImage(data);
            return writeJpeg(flattenAndFit(source));
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw new BadRequestException("Could not process this file. Please upload a valid image or PDF.");
        }
    }

    private BufferedImage renderPdfFirstPage(byte[] data) throws IOException {
        try (PDDocument doc = Loader.loadPDF(data, "", null, null, IOUtils.createTempFileOnlyStreamCache())) {
            if (doc.getNumberOfPages() < 1) {
                throw new BadRequestException("The PDF has no pages");
            }
            PDRectangle box = doc.getPage(0).getCropBox();
            float longestPoints = Math.max(box.getWidth(), box.getHeight());
            if (longestPoints <= 0) {
                throw new BadRequestException("The PDF page has no size");
            }
            // 72 points per inch; cap both resolution and output size.
            float scale = Math.min(PDF_MAX_DPI / 72f, MAX_SIDE / longestPoints);
            return new PDFRenderer(doc).renderImage(0, scale, ImageType.RGB);
        } catch (InvalidPasswordException e) {
            throw new BadRequestException("Password-protected PDFs are not supported");
        }
    }

    private BufferedImage readImage(byte[] data) throws IOException {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new BadRequestException("Unsupported image format");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if ((long) width * height > MAX_SOURCE_PIXELS) {
                    throw new BadRequestException("Image dimensions are too large");
                }
                ImageReadParam param = reader.getDefaultReadParam();
                int factor = Math.max(1, Math.max(width, height) / (MAX_SIDE * 2));
                if (factor > 1) {
                    param.setSourceSubsampling(factor, factor, 0, 0); // decode at reduced size to bound memory
                }
                return reader.read(0, param);
            } finally {
                reader.dispose();
            }
        }
    }

    /** Draws onto an opaque RGB canvas (transparent areas become white) scaled to fit MAX_SIDE. */
    private BufferedImage flattenAndFit(BufferedImage src) {
        double ratio = Math.min(1d, (double) MAX_SIDE / Math.max(src.getWidth(), src.getHeight()));
        int w = Math.max(1, (int) Math.round(src.getWidth() * ratio));
        int h = Math.max(1, (int) Math.round(src.getHeight() * ratio));
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, w, h);
            g.drawImage(src, 0, 0, w, h, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    private byte[] writeJpeg(BufferedImage image) throws IOException {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ImageOutputStream out = ImageIO.createImageOutputStream(bytes)) {
            writer.setOutput(out);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(QUALITY);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
        return bytes.toByteArray();
    }
}
