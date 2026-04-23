package com.noteapp.repository;

import com.noteapp.entity.Note;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
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
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq = cb.createQuery(Note.class);
        Root<Note> root = cq.from(Note.class);
        root.fetch("attachments", JoinType.LEFT);
        cq.distinct(true);
        cq.where(cb.or(
                cb.like(root.get("ticket"), "NOTE\\_%", '\\'),
                cb.like(root.get("ticket"), "MEETING%")));
        List<Note> specialNotes = em.createQuery(cq).getResultList();

        Set<String> specialTickets = new HashSet<>();
        for (Note n : specialNotes) {
            specialTickets.add(n.getTicket());
        }

        List<Note> results;

        if (dateFilter == null || "all".equals(dateFilter)) {
            CriteriaBuilder cbAll = em.getCriteriaBuilder();
            CriteriaQuery<Note> cqAll = cbAll.createQuery(Note.class);
            Root<Note> rootAll = cqAll.from(Note.class);
            rootAll.fetch("attachments", JoinType.LEFT);
            cqAll.distinct(true);
            results = em.createQuery(cqAll).getResultList();
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
                    CriteriaBuilder cbFallback = em.getCriteriaBuilder();
                    CriteriaQuery<Note> cqFallback = cbFallback.createQuery(Note.class);
                    Root<Note> rootFallback = cqFallback.from(Note.class);
                    rootFallback.fetch("attachments", JoinType.LEFT);
                    cqFallback.distinct(true);
                    results = em.createQuery(cqFallback).getResultList();
                    results.sort(Comparator.comparing(Note::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())));
                    return results;
                }
            }

            Set<String> qualifyingTickets = new HashSet<>(specialTickets);

            if (since != null) {
                CriteriaBuilder cbRange = em.getCriteriaBuilder();
                CriteriaQuery<String> cqRange = cbRange.createQuery(String.class);
                Root<Note> rootRange = cqRange.from(Note.class);
                cqRange.distinct(true);
                cqRange.select(rootRange.get("ticket"));
                cqRange.where(cbRange.and(
                        cbRange.greaterThanOrEqualTo(rootRange.get("createdAt"), since),
                        cbRange.not(cbRange.like(rootRange.get("ticket"), "NOTE\\_%", '\\')),
                        cbRange.not(cbRange.like(rootRange.get("ticket"), "MEETING%"))));
                List<String> ticketsInRange = em.createQuery(cqRange).getResultList();
                qualifyingTickets.addAll(ticketsInRange);
            } else {
                CriteriaBuilder cbYear = em.getCriteriaBuilder();
                CriteriaQuery<String> cqYear = cbYear.createQuery(String.class);
                Root<Note> rootYear = cqYear.from(Note.class);
                cqYear.distinct(true);
                cqYear.select(rootYear.get("ticket"));
                cqYear.where(cbYear.and(
                        cbYear.equal(cbYear.function("date_part", Double.class, cbYear.literal("year"),
                                rootYear.get("createdAt")), yearFilter.doubleValue()),
                        cbYear.not(cbYear.like(rootYear.get("ticket"), "NOTE\\_%", '\\')),
                        cbYear.not(cbYear.like(rootYear.get("ticket"), "MEETING%"))));
                List<String> ticketsInYear = em.createQuery(cqYear).getResultList();
                qualifyingTickets.addAll(ticketsInYear);
            }

            if (qualifyingTickets.isEmpty()) {
                return new ArrayList<>();
            }

            CriteriaBuilder cbFinal = em.getCriteriaBuilder();
            CriteriaQuery<Note> cqFinal = cbFinal.createQuery(Note.class);
            Root<Note> rootFinal = cqFinal.from(Note.class);
            rootFinal.fetch("attachments", JoinType.LEFT);
            cqFinal.distinct(true);
            cqFinal.where(rootFinal.get("ticket").in(new ArrayList<>(qualifyingTickets)));
            results = em.createQuery(cqFinal).getResultList();
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
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq = cb.createQuery(Note.class);
        Root<Note> root = cq.from(Note.class);
        root.fetch("attachments", JoinType.LEFT);
        cq.distinct(true);
        cq.where(cb.like(cb.lower(root.get("ticket")), q));
        List<Note> ticketMatches = em.createQuery(cq).getResultList();

        // 2. If ticket matches exist, return only those (avoids unrelated notes
        // whose content merely mentions the search term)
        if (!ticketMatches.isEmpty()) {
            ticketMatches.sort(Comparator.comparing(Note::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ticketMatches;
        }

        // 3. No ticket match — fall back to full-text search across all fields
        CriteriaBuilder cb2 = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq2 = cb2.createQuery(Note.class);
        Root<Note> root2 = cq2.from(Note.class);
        root2.fetch("attachments", JoinType.LEFT);
        cq2.distinct(true);
        cq2.where(cb2.or(
                cb2.like(cb2.lower(root2.get("note")), q),
                cb2.like(cb2.lower(root2.get("status")), q),
                cb2.like(cb2.lower(cb2.coalesce(root2.get("subject"), "")), q)));
        List<Note> results = em.createQuery(cq2).getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findAllWithAttachments — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findAllWithAttachments() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq = cb.createQuery(Note.class);
        Root<Note> root = cq.from(Note.class);
        root.fetch("attachments", JoinType.LEFT);
        cq.distinct(true);
        List<Note> results = em.createQuery(cq).getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findNotesByTickets — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findNotesByTickets(List<String> tickets) {
        if (tickets == null || tickets.isEmpty())
            return new ArrayList<>();
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq = cb.createQuery(Note.class);
        Root<Note> root = cq.from(Note.class);
        root.fetch("attachments", JoinType.LEFT);
        cq.distinct(true);
        cq.where(root.get("ticket").in(tickets));
        List<Note> results = em.createQuery(cq).getResultList();
        results.sort(Comparator.comparing(Note::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return results;
    }

    // -----------------------------------------------------------------------
    // findSpecialNotesWithAttachments — replaces @Query in NoteRepository
    // -----------------------------------------------------------------------
    @Override
    public List<Note> findSpecialNotesWithAttachments() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Note> cq = cb.createQuery(Note.class);
        Root<Note> root = cq.from(Note.class);
        root.fetch("attachments", JoinType.LEFT);
        cq.distinct(true);
        cq.where(cb.or(
                cb.like(root.get("ticket"), "NOTE\\_%", '\\'),
                cb.like(root.get("ticket"), "MEETING%")));
        List<Note> results = em.createQuery(cq).getResultList();
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
        if (ids == null || ids.isEmpty())
            return 0;
        return em.createQuery(
                "UPDATE Note n SET n.status = :status WHERE n.id IN :ids")
                .setParameter("status", status)
                .setParameter("ids", ids)
                .executeUpdate();
    }
}
