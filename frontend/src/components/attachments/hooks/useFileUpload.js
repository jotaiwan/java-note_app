import { useCallback, useRef } from "react";

/**
 * Custom hook for file upload functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.onFileSelect - Callback when files are selected
 * @returns {Object} File upload methods and refs
 */
export default function useFileUpload({ onFileSelect }) {
    const fileInputRef = useRef(null);

    const handleFileSelect = useCallback((event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            onFileSelect?.(files);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [onFileSelect]);

    const openFileDialog = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    return {
        fileInputRef,
        handleFileSelect,
        openFileDialog,
    };
}
