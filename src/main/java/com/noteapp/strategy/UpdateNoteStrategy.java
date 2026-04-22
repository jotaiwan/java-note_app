package com.noteapp.strategy;

import com.noteapp.entity.Note;
import com.noteapp.entity.NoteAttachment;
import com.noteapp.util.FileUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
public class UpdateNoteStrategy implements NoteStrategy {

    @Override
    public Note execute(Map<String, Object> data, List<MultipartFile> attachments, Note note) {
        if (note == null) {
            throw new IllegalArgumentException("Note must be provided for update strategy");
        }

        if (data.containsKey("ticket")) {
            note.setTicket((String) data.get("ticket"));
        }
        if (data.containsKey("note")) {
            note.setNote((String) data.get("note"));
        }
        if (data.containsKey("status")) {
            note.setStatus((String) data.get("status"));
        }
        if (data.containsKey("subject")) {
            note.setSubject((String) data.get("subject"));
        }

        // Handle deletions of existing attachments
        @SuppressWarnings("unchecked")
        List<Long> toDelete = (List<Long>) data.get("attachments_to_delete");
        if (toDelete != null && !toDelete.isEmpty()) {
            note.getAttachments().removeIf(a -> toDelete.contains(a.getId()));
        }

        // Add new attachments
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
