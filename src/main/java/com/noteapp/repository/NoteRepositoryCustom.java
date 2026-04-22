package com.noteapp.repository;

import com.noteapp.entity.Note;

import java.util.List;

public interface NoteRepositoryCustom {
    /**
     * Core query with special handling:
     * - NOTE_* and MEETING* tickets are always included regardless of date filter
     * - Other tickets: if any note matches the date filter, return ALL notes for that ticket
     *
     * @param dateFilter one of: "90", "180", "360", "2020".."<current_year>", "all", or null
     */
    List<Note> findAllWithSpecialHandling(String dateFilter);

    /** Full-text search across ticket, note, status, subject — eagerly loads attachments. */
    List<Note> searchNotes(String query);

    /** Return all notes with attachments eagerly loaded, ordered by createdAt DESC. */
    List<Note> findAllWithAttachments();

    /** Return all notes for the given tickets, with attachments eagerly loaded. */
    List<Note> findNotesByTickets(List<String> tickets);

    /** Return NOTE_* and MEETING* notes with attachments eagerly loaded. */
    List<Note> findSpecialNotesWithAttachments();

    /** Return all distinct years present in the notes table. */
    List<Integer> findDistinctYears();

    /** Batch-update status for the given note IDs. Returns count of updated rows. */
    int batchUpdateStatus(List<Long> ids, String status);
}
