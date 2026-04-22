package com.noteapp.controller;

import com.noteapp.service.CsvSqlGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/generate-sql")
public class NoteFileSqlGeneratorController {

    private final CsvSqlGeneratorService csvSqlGeneratorService;

    @Autowired
    public NoteFileSqlGeneratorController(CsvSqlGeneratorService csvSqlGeneratorService) {
        this.csvSqlGeneratorService = csvSqlGeneratorService;
    }

    @PostMapping(value = "/notes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> generateSql(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
            }
            Map<String, Object> result = csvSqlGeneratorService.generateSqlFromCsv(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
