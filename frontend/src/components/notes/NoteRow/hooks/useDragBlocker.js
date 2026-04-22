// src/components/notes/NoteRow/hooks/useDragBlocker.js
import { useRef, useEffect } from 'react';

// Global flag to track drag state across the entire app
let isDraggingGlobally = false;

export function useDragBlocker() {
    const dragCounter = useRef(0);

    useEffect(() => {
        const handleDragStart = (e) => {
            isDraggingGlobally = true;
            dragCounter.current = 1;
        };

        const handleDragEnter = () => {
            dragCounter.current++;
            isDraggingGlobally = true;
        };

        const handleDragLeave = () => {
            dragCounter.current--;
            if (dragCounter.current === 0) {
                isDraggingGlobally = false;
            }
        };

        const handleDragEnd = () => {
            dragCounter.current = 0;
            isDraggingGlobally = false;
        };

        const handleDrop = (e) => {
            // Small delay to ensure all events are processed
            setTimeout(() => {
                dragCounter.current = 0;
                isDraggingGlobally = false;
            }, 100);
        };

        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('drop', handleDrop);
        };
    }, []);

    return {
        isDragging: () => isDraggingGlobally
    };
}

// Direct function to check drag state without hook
export function isDraggingActive() {
    return isDraggingGlobally;
}