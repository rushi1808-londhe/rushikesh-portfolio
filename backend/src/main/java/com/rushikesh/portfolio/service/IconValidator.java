package com.rushikesh.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.rushikesh.portfolio.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Validates Iconify icon JSON before it is stored. The SVG body is injected into the page, so anything
 * that could execute script, load external resources or reference foreign documents is rejected.
 */
@Component
public class IconValidator {

    private static final int MAX_BODY = 50_000;
    private static final List<Pattern> FORBIDDEN = List.of(
            Pattern.compile("<\\s*/?\\s*(script|foreignobject|iframe|embed|object|image|style|animate\\w*|set|handler|feimage|link|meta|base)\\b", Pattern.CASE_INSENSITIVE),
            Pattern.compile("\\bon[a-z]+\\s*=", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(javascript|vbscript|data)\\s*:", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(xlink:)?href\\s*=\\s*[\"']\\s*(?!#)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("url\\(\\s*[\"']?\\s*(?!#)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("@import|<!(doctype|entity)|expression\\s*\\(", Pattern.CASE_INSENSITIVE)
    );

    private final ObjectMapper mapper;

    public IconValidator(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    /** Returns a normalised JSON string ({body,width,height}) or null when input is blank. */
    public String normalize(String iconJson) {
        if (iconJson == null || iconJson.isBlank()) return null;
        JsonNode node;
        try {
            node = mapper.readTree(iconJson);
        } catch (Exception e) {
            throw new BadRequestException("Logo data is not valid JSON");
        }
        JsonNode body = node.get("body");
        if (body == null || !body.isTextual() || body.asText().isBlank() || body.asText().length() > MAX_BODY) {
            throw new BadRequestException("Logo data must contain an SVG body");
        }
        String svg = body.asText();
        for (Pattern p : FORBIDDEN) {
            if (p.matcher(svg).find()) throw new BadRequestException("Logo contains unsupported SVG content");
        }
        ObjectNode out = mapper.createObjectNode();
        out.put("body", svg);
        out.put("width", dimension(node.get("width")));
        out.put("height", dimension(node.get("height")));
        return out.toString();
    }

    private static int dimension(JsonNode n) {
        int v = n != null && n.canConvertToInt() ? n.asInt() : 24;
        return Math.max(1, Math.min(4096, v));
    }
}
