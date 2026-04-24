package com.noteapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/docs")
public class DocController {

    @Value("${note.app.docs.base-path}")
    private String docsBasePath;

    @GetMapping("/{lang}/list")
    public ResponseEntity<?> listDocs(@PathVariable String lang) {
        Path dir = Paths.get(docsBasePath, lang);
        if (!Files.isDirectory(dir)) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        try {
            List<Map<String, String>> files = Files.list(dir)
                    .filter(p -> p.toString().endsWith(".md"))
                    .map(p -> {
                        Map<String, String> m = new LinkedHashMap<>();
                        m.put("filename", p.getFileName().toString());
                        m.put("name", p.getFileName().toString().replace(".md", ""));
                        return m;
                    })
                    .sorted(Comparator.comparing(m -> m.get("filename")))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{lang}/{filename}")
    public ResponseEntity<?> getDoc(@PathVariable String lang, @PathVariable String filename) {
        // Sanitize filename to prevent path traversal
        String safeName = filename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
        if (!safeName.endsWith(".md")) safeName += ".md";
        Path filePath = Paths.get(docsBasePath, lang, safeName);

        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            return ResponseEntity.status(404).body(Map.of("error", "Document not found"));
        }
        try {
            String content = Files.readString(filePath);
            return ResponseEntity.ok(Map.of("content", content, "filename", safeName));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
