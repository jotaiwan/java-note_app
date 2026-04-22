package com.noteapp.entity;

import jakarta.persistence.PreUpdate;

public class NoteEntityListener {

    @PreUpdate
    public void preUpdate(Note note) {
        note.preUpdate();
    }
}
