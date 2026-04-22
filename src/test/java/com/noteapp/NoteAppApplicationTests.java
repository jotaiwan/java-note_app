package com.noteapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/note_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class NoteAppApplicationTests {

    @Test
    void contextLoads() {
    }
}
