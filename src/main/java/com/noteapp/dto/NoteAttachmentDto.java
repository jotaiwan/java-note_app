package com.noteapp.dto;

import com.noteapp.entity.NoteAttachment;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Getter
@Setter
@NoArgsConstructor
public class NoteAttachmentDto {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long id;
    private Long noteId;
    private String fileName;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private String formattedFileSize;
    private String fileCategory;
    private String description;
    private String createdAt;
    private String updatedAt;
    // base64-encoded file data (only when requested)
    private String fileData;

    public static NoteAttachmentDto fromEntity(NoteAttachment attachment, boolean includeData) {
        NoteAttachmentDto dto = new NoteAttachmentDto();
        dto.setId(attachment.getId());
        dto.setNoteId(attachment.getNote() != null ? attachment.getNote().getId() : null);
        dto.setFileName(attachment.getFileName());
        dto.setOriginalFileName(attachment.getOriginalFileName());
        dto.setMimeType(attachment.getMimeType());
        dto.setFileSize(attachment.getFileSize());
        dto.setFormattedFileSize(attachment.getFormattedFileSize());
        dto.setFileCategory(attachment.getFileCategory());
        dto.setDescription(attachment.getDescription());
        dto.setCreatedAt(attachment.getCreatedAt() != null ? attachment.getCreatedAt().format(FORMATTER) : null);
        dto.setUpdatedAt(attachment.getUpdatedAt() != null ? attachment.getUpdatedAt().format(FORMATTER) : null);
        if (includeData && attachment.getFileData() != null) {
            dto.setFileData(Base64.getEncoder().encodeToString(attachment.getFileData()));
        }
        return dto;
    }

    public static NoteAttachmentDto fromEntity(NoteAttachment attachment) {
        return fromEntity(attachment, false);
    }
}
