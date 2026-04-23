package com.noteapp.repository;

import com.noteapp.entity.NoteAttachment;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class NoteAttachmentRepositoryImpl {

    @PersistenceContext
    private EntityManager em;

    public long getTotalStorage() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Long> cq = cb.createQuery(Long.class);
        Root<NoteAttachment> root = cq.from(NoteAttachment.class);
        cq.select(cb.coalesce(cb.sum(root.get("fileSize")), 0L));
        return em.createQuery(cq).getSingleResult();
    }

    public List<Object[]> getStorageByCategory() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<NoteAttachment> root = cq.from(NoteAttachment.class);
        cq.multiselect(
                root.get("fileCategory"),
                cb.count(root),
                cb.coalesce(cb.sum(root.get("fileSize")), 0L));
        cq.groupBy(root.get("fileCategory"));
        return em.createQuery(cq).getResultList();
    }

    public List<Object[]> getCountByCategory() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<NoteAttachment> root = cq.from(NoteAttachment.class);
        cq.multiselect(
                root.get("fileCategory"),
                cb.count(root));
        cq.groupBy(root.get("fileCategory"));
        return em.createQuery(cq).getResultList();
    }
}