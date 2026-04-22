package com.noteapp.strategy;

import com.noteapp.entity.Note;
import com.noteapp.entity.NoteAttachment;
import com.noteapp.util.FileUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
public class CreateNoteStrategy implements NoteStrategy {

    @Override
    public Note execute(Map<String, Object> data, List<MultipartFile> attachments, Note existingNote) {
        Note note = new Note();

        note.setTicket((String) data.getOrDefault("ticket", ""));
        note.setNote((String) data.get("note"));
        note.setStatus((String) data.getOrDefault("status", "open"));
        note.setSubject((String) data.get("subject"));

        // Support custom created_at date
        String createdStr = (String) data.get("created");
        if (createdStr != null && !createdStr.isBlank()) {
            try {
                note.setCreatedAt(LocalDateTime.parse(createdStr,
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            } catch (Exception e) {
                try {
                    note.setCreatedAt(LocalDateTime.parse(createdStr,
                            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")));
                } catch (Exception e2) {
                    note.setCreatedAt(LocalDateTime.now());
                }
            }
        } else {
            note.setCreatedAt(LocalDateTime.now());
        }

        // Handle uploaded files
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                if (file == null || file.isEmpty()) continue;
                try {
                    NoteAttachment attachment = buildAttachment(file, note);
                    note.getAttachments().add(attachment);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to process attachment: " + file.getOriginalFilename(), e);
                }
            }
        }

        return note;
    }

    private NoteAttachment buildAttachment(MultipartFile file, Note note) throws IOException {
        NoteAttachment attachment = new NoteAttachment();
        attachment.setNote(note);
        attachment.setOriginalFileName(file.getOriginalFilename());
        attachment.setFileName(FileUtil.generateUniqueFileName(file.getOriginalFilename()));
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileData(file.getBytes());
        attachment.setFileCategory(FileUtil.determineCategory(file.getContentType(), file.getOriginalFilename()));
        return attachment;
    }
}
