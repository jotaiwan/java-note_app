package com.noteapp.service;

import com.noteapp.context.NoteOperationContext;
import com.noteapp.dto.NoteDto;
import com.noteapp.entity.Note;
import com.noteapp.entity.NoteAttachment;
import com.noteapp.repository.NoteAttachmentRepository;
import com.noteapp.repository.NoteRepository;
import com.noteapp.strategy.CreateNoteStrategy;
import com.noteapp.strategy.UpdateNoteStrategy;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private static final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;
    private final NoteAttachmentRepository attachmentRepository;
    private final CreateNoteStrategy createStrategy;
    private final UpdateNoteStrategy updateStrategy;

    @Autowired
    public NoteService(NoteRepository noteRepository,
                       NoteAttachmentRepository attachmentRepository,
                       CreateNoteStrategy createStrategy,
                       UpdateNoteStrategy updateStrategy) {
        this.noteRepository = noteRepository;
        this.attachmentRepository = attachmentRepository;
        this.createStrategy = createStrategy;
        this.updateStrategy = updateStrategy;
    }

    public List<NoteDto> getAllNotes(String dateFilter) {
        List<Note> notes = noteRepository.findAllWithSpecialHandling(dateFilter);
        return notes.stream().map(NoteDto::fromEntity).collect(Collectors.toList());
    }

    public NoteDto getNoteById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Note not found: " + id));
        return NoteDto.fromEntity(note);
    }

    public List<NoteDto> searchNotes(String query) {
        return noteRepository.searchNotes(query).stream()
                .map(NoteDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDto createNote(Map<String, Object> data, List<MultipartFile> attachments) {
        NoteOperationContext context = new NoteOperationContext();
        context.setStrategy(createStrategy);
        Note note = context.executeStrategy(data, attachments, null);
        note = noteRepository.save(note);
        return NoteDto.fromEntity(note);
    }

    @Transactional
    public NoteDto updateNote(Long id, Map<String, Object> data, List<MultipartFile> attachments) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Note not found: " + id));
        NoteOperationContext context = new NoteOperationContext();
        context.setStrategy(updateStrategy);
        note = context.executeStrategy(data, attachments, note);
        note = noteRepository.save(note);
        return NoteDto.fromEntity(note);
    }

    @Transactional
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new EntityNotFoundException("Note not found: " + id);
        }
        noteRepository.deleteById(id);
    }

    @Transactional
    public NoteDto updateStatus(Long id, String status) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Note not found: " + id));
        note.setStatus(status);
        note = noteRepository.save(note);
        return NoteDto.fromEntity(note);
    }

    @Transactional
    public int batchDelete(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            if (noteRepository.existsById(id)) {
                noteRepository.deleteById(id);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public int batchUpdateStatus(List<Long> ids, String status) {
        return noteRepository.batchUpdateStatus(ids, status);
    }

    public Optional<NoteAttachment> getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId);
    }

    public List<Map<String, Object>> getAttachmentInfoByNote(Long noteId) {
        return attachmentRepository.findByNoteIdOrderByCreatedAtAsc(noteId).stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("fileName", a.getFileName());
            m.put("originalFileName", a.getOriginalFileName());
            m.put("mimeType", a.getMimeType());
            m.put("fileSize", a.getFileSize());
            m.put("formattedFileSize", a.getFormattedFileSize());
            m.put("fileCategory", a.getFileCategory());
            m.put("description", a.getDescription());
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(Long noteId, Long attachmentId) {
        NoteAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found: " + attachmentId));
        if (!attachment.getNote().getId().equals(noteId)) {
            throw new IllegalArgumentException("Attachment does not belong to note " + noteId);
        }
        attachmentRepository.delete(attachment);
    }

    public Map<String, Object> getStatistics() {
        long totalNotes = noteRepository.count();
        long totalAttachments = attachmentRepository.count();
        long totalStorage = attachmentRepository.getTotalStorage();
        List<Object[]> storageByCategory = attachmentRepository.getStorageByCategory();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total_notes", totalNotes);
        stats.put("total_attachments", totalAttachments);
        stats.put("total_storage_bytes", totalStorage);
        stats.put("total_storage_formatted", formatBytes(totalStorage));

        Map<String, Object> byCategory = new LinkedHashMap<>();
        for (Object[] row : storageByCategory) {
            String category = (String) row[0];
            long count = ((Number) row[1]).longValue();
            long storage = ((Number) row[2]).longValue();
            Map<String, Object> catData = new LinkedHashMap<>();
            catData.put("count", count);
            catData.put("storage_bytes", storage);
            catData.put("storage_formatted", formatBytes(storage));
            byCategory.put(category, catData);
        }
        stats.put("by_category", byCategory);
        return stats;
    }

    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            long count = noteRepository.count();
            result.put("status", "ok");
            result.put("note_count", count);
            result.put("timestamp", LocalDateTime.now().toString());
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }
        return result;
    }

    public List<Map<String, Object>> getDateFilters() {
        List<Integer> years = noteRepository.findDistinctYears();
        List<Map<String, Object>> filters = new ArrayList<>();

        // Recent filters
        int[] days = {90, 180, 360};
        String[] labels = {"Last 90 days", "Last 180 days", "Last year"};
        for (int i = 0; i < days.length; i++) {
            Map<String, Object> f = new LinkedHashMap<>();
            f.put("value", String.valueOf(days[i]));
            f.put("label", labels[i]);
            filters.add(f);
        }

        // Year filters
        for (int year : years) {
            Map<String, Object> f = new LinkedHashMap<>();
            f.put("value", String.valueOf(year));
            f.put("label", String.valueOf(year));
            filters.add(f);
        }

        // All
        Map<String, Object> all = new LinkedHashMap<>();
        all.put("value", "all");
        all.put("label", "All");
        filters.add(all);

        return filters;
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024L * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
