package com.noteapp.dto;

import com.noteapp.entity.Note;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class NoteDto {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long id;
    private String ticket;
    private String subject;
    private String createdAt;
    private String updatedAt;
    private String status;
    private String note;
    private List<NoteAttachmentDto> attachments = new ArrayList<>();

    // Backward-compat alias (frontend still reads noteImages in some places)
    private List<NoteAttachmentDto> noteImages = new ArrayList<>();

    public static NoteDto fromEntity(Note noteEntity, boolean includeAttachmentData) {
        NoteDto dto = new NoteDto();
        dto.setId(noteEntity.getId());
        dto.setTicket(noteEntity.getTicket());
        dto.setSubject(noteEntity.getSubject());
        dto.setCreatedAt(noteEntity.getCreatedAt() != null ? noteEntity.getCreatedAt().format(FORMATTER) : null);
        dto.setUpdatedAt(noteEntity.getUpdatedAt() != null ? noteEntity.getUpdatedAt().format(FORMATTER) : null);
        dto.setStatus(noteEntity.getStatus());
        dto.setNote(noteEntity.getNote());

        if (noteEntity.getAttachments() != null) {
            List<NoteAttachmentDto> attachmentDtos = noteEntity.getAttachments().stream()
                    .map(a -> NoteAttachmentDto.fromEntity(a, includeAttachmentData))
                    .collect(Collectors.toList());
            dto.setAttachments(attachmentDtos);

            // Backward compat: expose image attachments as noteImages
            List<NoteAttachmentDto> imageDtos = noteEntity.getAttachments().stream()
                    .filter(a -> "image".equals(a.getFileCategory()))
                    .map(a -> NoteAttachmentDto.fromEntity(a, includeAttachmentData))
                    .collect(Collectors.toList());
            dto.setNoteImages(imageDtos);
        }

        return dto;
    }

    public static NoteDto fromEntity(Note noteEntity) {
        return fromEntity(noteEntity, false);
    }

    public NoteDto toSimple() {
        NoteDto simple = new NoteDto();
        simple.setId(this.id);
        simple.setTicket(this.ticket);
        simple.setSubject(this.subject);
        simple.setCreatedAt(this.createdAt);
        simple.setUpdatedAt(this.updatedAt);
        simple.setStatus(this.status);
        simple.setNote(this.note);
        // no attachments
        return simple;
    }
}
