package com.noteapp.repository;

import com.noteapp.entity.Note;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class NoteRepositoryImpl implements NoteRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    // -----------------------------------------------------------------------
    // findAllWithSpecialHandling — unchanged logic, kept as-is
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findAllWithSpecialHandling(String dateFilter) {

        // 1. Always include NOTE_* and MEETING* tickets regardless of date filter.
        List<Note> specialNotes = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                "WHERE n.ticket LIKE 'NOTE\\_%' ESCAPE '\\' " +
                "   OR n.ticket LIKE 'MEETING%'",
                Note.class)
                .getResultList();

        Set<String> specialTickets = new HashSet<>();
        for (Note n : specialNotes) {
            specialTickets.add(n.getTicket());
        }

        List<Note> results;

        if (dateFilter == null || "all".equals(dateFilter)) {
            results = em.createQuery(
                    "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments",
                    Note.class).getResultList();
        } else {
            LocalDateTime since = null;
            Integer yearFilter = null;

            try {
                int days = Integer.parseInt(dateFilter);
                since = LocalDateTime.now().minusDays(days);
            } catch (NumberFormatException e) {
                try {
                    yearFilter = Integer.parseInt(dateFilter);
                } catch (NumberFormatException ex) {
                    results = em.createQuery(
                            "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments",
                            Note.class).getResultList();
                    results.sort(Comparator.comparing(Note::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())));
                    return results;
                }
            }

            Set<String> qualifyingTickets = new HashSet<>(specialTickets);

            if (since != null) {
                List<String> ticketsInRange = em.createQuery(
                        "SELECT DISTINCT n.ticket FROM Note n " +
                        "WHERE n.createdAt >= :since " +
                        "AND n.ticket NOT LIKE 'NOTE\\_%' ESCAPE '\\' " +
                        "AND n.ticket NOT LIKE 'MEETING%'",
                        String.class)
                        .setParameter("since", since)
                        .getResultList();
                qualifyingTickets.addAll(ticketsInRange);
            } else {
                List<String> ticketsInYear = em.createQuery(
                        "SELECT DISTINCT n.ticket FROM Note n " +
                        "WHERE FUNCTION('date_part', 'year', n.createdAt) = :year " +
                        "AND n.ticket NOT LIKE 'NOTE\\_%' ESCAPE '\\' " +
                        "AND n.ticket NOT LIKE 'MEETING%'",
                        String.class)
                        .setParameter("year", yearFilter.doubleValue())
                        .getResultList();
                qualifyingTickets.addAll(ticketsInYear);
            }

            if (qualifyingTickets.isEmpty()) {
                return new ArrayList<>();
            }

            results = em.createQuery(
                    "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                    "WHERE n.ticket IN :tickets",
                    Note.class)
                    .setParameter("tickets", new ArrayList<>(qualifyingTickets))
                    .getResultList();
        }

        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // searchNotes — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> searchNotes(String query) {
        String q = "%" + query.toLowerCase() + "%";

        // 1. Try ticket-only match first
        List<Note> ticketMatches = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                "WHERE LOWER(n.ticket) LIKE :q",
                Note.class)
                .setParameter("q", q)
                .getResultList();

        // 2. If ticket matches exist, return only those (avoids unrelated notes
        //    whose content merely mentions the search term)
        if (!ticketMatches.isEmpty()) {
            ticketMatches.sort(Comparator.comparing(Note::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ticketMatches;
        }

        // 3. No ticket match — fall back to full-text search across all fields
        List<Note> results = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                "WHERE LOWER(n.note)   LIKE :q " +
                "   OR LOWER(n.status) LIKE :q " +
                "   OR LOWER(COALESCE(n.subject, '')) LIKE :q",
                Note.class)
                .setParameter("q", q)
                .getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findAllWithAttachments — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findAllWithAttachments() {
        List<Note> results = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments",
                Note.class).getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findNotesByTickets — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findNotesByTickets(List<String> tickets) {
        if (tickets == null || tickets.isEmpty()) return new ArrayList<>();
        List<Note> results = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                "WHERE n.ticket IN :tickets",
                Note.class)
                .setParameter("tickets", tickets)
                .getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findSpecialNotesWithAttachments — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findSpecialNotesWithAttachments() {
        List<Note> results = em.createQuery(
                "SELECT DISTINCT n FROM Note n LEFT JOIN FETCH n.attachments " +
                "WHERE n.ticket LIKE 'NOTE\\_%' ESCAPE '\\' " +
                "   OR n.ticket LIKE 'MEETING%'",
                Note.class)
                .getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findDistinctYears — replaces native @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Integer> findDistinctYears() {
        List<Number> raw = em.createNativeQuery(
                "SELECT DISTINCT CAST(EXTRACT(YEAR FROM created_at) AS INTEGER) AS year " +
                "FROM notes ORDER BY year DESC")
                .getResultList();
        List<Integer> years = new ArrayList<>();
        for (Number n : raw) {
            years.add(n.intValue());
        }
        return years;
    }

    // -----------------------------------------------------------------------
    // batchUpdateStatus — replaces @Modifying @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    @Transactional
    public int batchUpdateStatus(List<Long> ids, String status) {
        if (ids == null || ids.isEmpty()) return 0;
        return em.createQuery(
                "UPDATE Note n SET n.status = :status WHERE n.id IN :ids")
                .setParameter("status", status)
                .setParameter("ids", ids)
                .executeUpdate();
    }
}
