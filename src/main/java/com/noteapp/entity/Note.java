package com.noteapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "notes")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(com.noteapp.entity.NoteEntityListener.class)
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket", nullable = false, length = 50)
    private String ticket;

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "open";

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<NoteAttachment> attachments = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public List<NoteAttachment> getImageAttachments() {
        return attachments.stream()
                .filter(NoteAttachment::isImage)
                .collect(Collectors.toList());
    }

    public List<NoteAttachment> getAttachmentsByCategory(String category) {
        return attachments.stream()
                .filter(a -> category.equals(a.getFileCategory()))
                .collect(Collectors.toList());
    }
}
