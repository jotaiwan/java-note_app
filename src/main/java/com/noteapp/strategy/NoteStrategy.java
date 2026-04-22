package com.noteapp.strategy;

import com.noteapp.entity.Note;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface NoteStrategy {
    Note execute(Map<String, Object> data, List<MultipartFile> attachments, Note existingNote);
}
