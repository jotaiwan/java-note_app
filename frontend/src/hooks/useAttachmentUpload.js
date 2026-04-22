// src/hooks/useAttachmentUpload.js
import { useAttachments, useFileUpload } from '../components/attachments';
import { useImageUpload } from './useImageUpload'; // Fix: import directly from file
import { validateFiles, MAX_FILES_PER_NOTE } from '../components/attachments/utils/fileConstants';
import { ATTACHMENT_ERRORS } from '../components/attachments/utils/errorMessages';

export const useAttachmentUpload = (content, setContent, options = {}) => {
    const {
        attachments,
        processFiles,
        removeAttachment,
        clearAllAttachments
    } = useAttachments(content, setContent);

    const {
        images,
        imagePreviews,
        handleImagePaste,
        removeImage,
        clearImages
    } = useImageUpload();

    const { fileInputRef, handleFileSelect, openFileDialog } = useFileUpload({
        onFileSelect: (files) => {
            // Validate files
            const validation = validateFiles(files);
            if (!validation.valid) {
                alert(validation.errors.join('\n'));
                return;
            }

            // Check total files limit
            const totalFiles = attachments.length + images.length + files.length;
            if (totalFiles > MAX_FILES_PER_NOTE) {
                alert(ATTACHMENT_ERRORS.MAX_FILES(MAX_FILES_PER_NOTE));
                return;
            }

            processFiles(files);
        }
    });

    const handlePaste = (event) => {
        handleImagePaste(event, (newImage) => {
            // Validate image
            const validation = validateFiles([newImage.file]);
            if (!validation.valid) {
                alert(validation.errors.join('\n'));
                return;
            }

            // Check total files limit
            const totalFiles = attachments.length + images.length + 1;
            if (totalFiles > MAX_FILES_PER_NOTE) {
                alert(ATTACHMENT_ERRORS.MAX_FILES(MAX_FILES_PER_NOTE));
                return;
            }

            const placeholder = `[${newImage.displayName}] `;

            if (options.onImagePasted) {
                options.onImagePasted(placeholder, newImage);
            }
        });
    };

    const handleRemove = (id) => {
        const image = imagePreviews.find(img => img.id === id);
        if (image) {
            const displayName = removeImage(id);
            if (displayName && options.onImageRemoved) {
                options.onImageRemoved(displayName);
            }
        } else {
            removeAttachment(id);
        }
    };

    const clearAll = () => {
        clearAllAttachments();
        clearImages();
    };

    const handleDrop = (files) => {
        const validation = validateFiles(Array.from(files));
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return false;
        }

        const totalFiles = attachments.length + images.length + files.length;
        if (totalFiles > MAX_FILES_PER_NOTE) {
            alert(ATTACHMENT_ERRORS.MAX_FILES(MAX_FILES_PER_NOTE));
            return false;
        }

        processFiles(files);
        return true;
    };

    return {
        // Data
        attachments,
        images,
        imagePreviews,

        // File handling
        fileInputRef,
        openFileDialog,
        handleFileSelect: (e) => handleFileSelect(e),

        // Image handling
        handlePaste,

        // Remove handling
        handleRemove,

        // Drop handling
        handleDrop,

        // Cleanup
        clearAll
    };
};