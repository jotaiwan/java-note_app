package com.noteapp.controller;

import com.noteapp.dto.NoteDto;
import com.noteapp.entity.NoteAttachment;
import com.noteapp.service.NoteService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private static final Logger log = LoggerFactory.getLogger(NoteController.class);

    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<?> getAllNotes(@RequestParam(required = false) String date_filter) {
        try {
            List<NoteDto> notes = noteService.getAllNotes(date_filter);
            return ResponseEntity.ok(Map.of("success", true, "data", notes, "count", notes.size()));
        } catch (Exception e) {
            log.error("Error fetching notes", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/date-filters")
    public ResponseEntity<?> getDateFilters() {
        return ResponseEntity.ok(noteService.getDateFilters());
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam("q") String query) {
        try {
            List<NoteDto> notes = noteService.searchNotes(query);
            return ResponseEntity.ok(Map.of("success", true, "data", notes, "count", notes.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> statistics() {
        return ResponseEntity.ok(noteService.getStatistics());
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(noteService.healthCheck());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNote(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(noteService.getNoteById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> getNoteAttachments(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(noteService.getAttachmentInfoByNote(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> viewAttachment(@PathVariable Long attachmentId) {
        Optional<NoteAttachment> opt = noteService.getAttachment(attachmentId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Attachment not found"));
        }
        NoteAttachment attachment = opt.get();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(attachment.getOriginalFileName()).build().toString())
                .body(attachment.getFileData());
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<?> downloadAttachment(@PathVariable Long attachmentId) {
        Optional<NoteAttachment> opt = noteService.getAttachment(attachmentId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Attachment not found"));
        }
        NoteAttachment attachment = opt.get();
        String encodedName = URLEncoder.encode(attachment.getOriginalFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .body(attachment.getFileData());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createNote(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "attachments[]", required = false) List<MultipartFile> attachments,
            @RequestParam(value = "images[]", required = false) List<MultipartFile> images) {
        try {
            Map<String, Object> data = new HashMap<>(params);
            List<MultipartFile> allFiles = new ArrayList<>();
            if (attachments != null) allFiles.addAll(attachments);
            if (images != null) allFiles.addAll(images);

            NoteDto created = noteService.createNote(data, allFiles);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", created, "message", "Note created successfully"));
        } catch (Exception e) {
            log.error("Error creating note", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateNote(
            @PathVariable Long id,
            @RequestParam Map<String, String> params,
            @RequestParam(value = "attachments[]", required = false) List<MultipartFile> attachments,
            @RequestParam(value = "images[]", required = false) List<MultipartFile> images,
            @RequestParam(value = "existingAttachments[toDelete][]", required = false) List<Long> toDelete) {
        try {
            Map<String, Object> data = new HashMap<>(params);
            if (toDelete != null && !toDelete.isEmpty()) {
                data.put("attachments_to_delete", toDelete);
            }
            List<MultipartFile> allFiles = new ArrayList<>();
            if (attachments != null) allFiles.addAll(attachments);
            if (images != null) allFiles.addAll(images);

            NoteDto updated = noteService.updateNote(id, data, allFiles);
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Note updated successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating note {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            NoteDto updated = noteService.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("data", updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        try {
            noteService.deleteNote(id);
            return ResponseEntity.ok(Map.of("message", "Note deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{noteId}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long noteId, @PathVariable Long attachmentId) {
        try {
            noteService.deleteAttachment(noteId, attachmentId);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/batch/delete")
    public ResponseEntity<?> batchDelete(@RequestBody Map<String, List<Long>> body) {
        try {
            List<Long> ids = body.get("ids");
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "ids required"));
            }
            int count = noteService.batchDelete(ids);
            return ResponseEntity.ok(Map.of("deleted", count));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/batch/status")
    public ResponseEntity<?> batchUpdateStatus(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> rawIds = (List<Integer>) body.get("ids");
            List<Long> ids = rawIds.stream().map(i -> i.longValue()).toList();
            String status = (String) body.get("status");
            if (ids == null || ids.isEmpty() || status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "ids and status required"));
            }
            int updated = noteService.batchUpdateStatus(ids, status);
            return ResponseEntity.ok(Map.of("updated", updated));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
