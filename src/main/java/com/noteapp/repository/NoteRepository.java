package com.noteapp.repository;

import com.noteapp.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long>, NoteRepositoryCustom {
    // All custom queries are implemented via NoteRepositoryCustom / NoteRepositoryImpl
    // using Hibernate EntityManager — no @Query annotations needed here.
}
