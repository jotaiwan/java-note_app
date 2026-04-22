// src/components/notes/NoteRow/hooks/useDragState.js
import { useState, useEffect } from 'react';

let globalIsDragging = false;

export function useDragState() {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleDragStart = () => {
            globalIsDragging = true;
            setIsDragging(true);
        };

        const handleDragEnd = () => {
            globalIsDragging = false;
            setIsDragging(false);
        };

        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('drop', handleDragEnd);

        return () => {
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('drop', handleDragEnd);
        };
    }, []);

    return {
        isDragging: globalIsDragging || isDragging
    };
}