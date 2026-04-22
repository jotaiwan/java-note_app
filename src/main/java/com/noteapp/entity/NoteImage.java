package com.noteapp.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @deprecated Superseded by {@link NoteAttachment}. Not mapped to any DB table.
 */
@Getter
@Setter
@NoArgsConstructor
@Deprecated
public class NoteImage {

    private Long id;
    private Note note;
    private byte[] imageData;
    private String mimeType;
    private String imageName;
    private LocalDateTime createdAt;
}
