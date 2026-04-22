package com.noteapp.context;

import com.noteapp.entity.Note;
import com.noteapp.strategy.NoteStrategy;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public class NoteOperationContext {

    private NoteStrategy strategy;

    public void setStrategy(NoteStrategy strategy) {
        this.strategy = strategy;
    }

    public Note executeStrategy(Map<String, Object> data, List<MultipartFile> attachments, Note existingNote) {
        if (strategy == null) {
            throw new IllegalStateException("No strategy set on NoteOperationContext");
        }
        return strategy.execute(data, attachments, existingNote);
    }
}
