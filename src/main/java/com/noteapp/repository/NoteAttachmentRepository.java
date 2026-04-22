package com.noteapp.repository;

import com.noteapp.entity.NoteAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteAttachmentRepository extends JpaRepository<NoteAttachment, Long> {

    List<NoteAttachment> findByNoteIdOrderByCreatedAtAsc(Long noteId);

    List<NoteAttachment> findByFileCategoryOrderByCreatedAtDesc(String fileCategory);

    // Statistics — belongs here, not in NoteRepository
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM NoteAttachment a")
    long getTotalStorage();

    @Query("SELECT a.fileCategory, COUNT(a), COALESCE(SUM(a.fileSize), 0) FROM NoteAttachment a GROUP BY a.fileCategory")
    List<Object[]> getStorageByCategory();

    @Query("SELECT a.fileCategory, COUNT(a) FROM NoteAttachment a GROUP BY a.fileCategory")
    List<Object[]> getCountByCategory();
}
