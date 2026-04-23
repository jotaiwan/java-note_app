package com.noteapp.repository;

import com.noteapp.entity.NoteAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteAttachmentRepository extends JpaRepository<NoteAttachment, Long> {

    List<NoteAttachment> findByNoteIdOrderByCreatedAtAsc(Long noteId);

    List<NoteAttachment> findByFileCategoryOrderByCreatedAtDesc(String fileCategory);

    // Statistics — implemented using Criteria API in NoteAttachmentRepositoryImpl
    long getTotalStorage();

    List<Object[]> getStorageByCategory();

    List<Object[]> getCountByCategory();
}
