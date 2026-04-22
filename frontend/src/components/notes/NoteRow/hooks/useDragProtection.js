// src/components/notes/NoteRow/hooks/useDragProtection.js
import { useEffect, useRef } from 'react';

let dragInProgress = false;
let protectionActive = false;

export function useDragProtection() {
    const protectionRef = useRef(false);

    useEffect(() => {
        const handleDragStart = () => {
            dragInProgress = true;
            protectionActive = true;
            protectionRef.current = true;

            // Add a global class to body to indicate drag state
            document.body.classList.add('drag-in-progress');

            // Disable all attachment clicks by adding a pointer-events style
            const style = document.createElement('style');
            style.id = 'drag-protection-style';
            style.textContent = `
                [class*="attachment"] {
                    pointer-events: none !important;
                    user-select: none !important;
                }
                .note-attachments * {
                    pointer-events: none !important;
                }
            `;
            document.head.appendChild(style);
        };

        const handleDragEnd = () => {
            // Don't disable immediately, wait a bit
            setTimeout(() => {
                dragInProgress = false;
                protectionActive = false;
                protectionRef.current = false;
                document.body.classList.remove('drag-in-progress');

                // Remove the protection style
                const style = document.getElementById('drag-protection-style');
                if (style) {
                    style.remove();
                }
            }, 500); // Wait 500ms before re-enabling clicks
        };

        const handleDrop = (e) => {
            // Check if we're dropping files
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                handleDragEnd();
            }
        };

        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('dragend', handleDragEnd);
            document.removeEventListener('drop', handleDrop);

            // Clean up style
            const style = document.getElementById('drag-protection-style');
            if (style) {
                style.remove();
            }
        };
    }, []);

    return {
        isProtected: () => protectionActive || dragInProgress || protectionRef.current
    };
}

export function isDragProtected() {
    return document.body.classList.contains('drag-in-progress');
}