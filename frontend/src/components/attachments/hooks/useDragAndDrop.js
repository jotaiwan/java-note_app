import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook for drag and drop functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.onDrop - Callback when files are dropped
 * @param {boolean} options.enabled - Whether drag and drop is enabled
 * @returns {Object} Drag and drop state and refs
 */
export default function useDragAndDrop({ onDrop, enabled = true }) {
    const [isDragging, setIsDragging] = useState(false);
    const dropAreaRef = useRef(null);
    const dragCounter = useRef(0);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!enabled) return;

        dragCounter.current++;
        setIsDragging(true);
    }, [enabled]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!enabled) return;

        e.dataTransfer.dropEffect = "copy";
    }, [enabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!enabled) return;

        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, [enabled]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!enabled) return;

        dragCounter.current = 0;
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            onDrop?.(files);
            return;
        }

        // Try to get files from items
        const items = e.dataTransfer?.items;
        if (items) {
            const fileArray = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) {
                        fileArray.push(file);
                    }
                }
            }
            if (fileArray.length > 0) {
                onDrop?.(fileArray);
            }
        }
    }, [enabled, onDrop]);

    useEffect(() => {
        if (!enabled || !dropAreaRef.current) return;

        const dropArea = dropAreaRef.current;

        dropArea.addEventListener("dragenter", handleDragEnter);
        dropArea.addEventListener("dragover", handleDragOver);
        dropArea.addEventListener("dragleave", handleDragLeave);
        dropArea.addEventListener("drop", handleDrop);

        // Prevent default drag/drop on document
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        document.addEventListener("dragenter", preventDefaults);
        document.addEventListener("dragover", preventDefaults);
        document.addEventListener("drop", preventDefaults);

        return () => {
            dropArea.removeEventListener("dragenter", handleDragEnter);
            dropArea.removeEventListener("dragover", handleDragOver);
            dropArea.removeEventListener("dragleave", handleDragLeave);
            dropArea.removeEventListener("drop", handleDrop);

            document.removeEventListener("dragenter", preventDefaults);
            document.removeEventListener("dragover", preventDefaults);
            document.removeEventListener("drop", preventDefaults);
        };
    }, [enabled, handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

    return {
        isDragging,
        dropAreaRef,
        setIsDragging,
    };
}
