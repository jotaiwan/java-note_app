// src/services/api.js

export async function fetchNotes() {
    const response = await fetch('http://127.0.0.1:8001/api/notes');
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    return response.json();
}
