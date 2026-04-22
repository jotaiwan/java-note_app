// src/components/attachments/utils/errorMessages.js
export const ATTACHMENT_ERRORS = {
    SIZE_EXCEEDED: (fileName) => `File "${fileName}" exceeds 10MB limit`,
    TYPE_NOT_ALLOWED: (fileName, fileType) => `File type "${fileType}" not allowed for "${fileName}"`,
    MAX_FILES: (max) => `Maximum ${max} files allowed per note`,
    UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    DELETE_FAILED: 'Failed to delete file. Please try again.',
    TICKET_REQUIRED: 'Please enter a ticket number',
    CONTENT_REQUIRED: 'Please enter note content',
    UPDATE_FAILED: 'Failed to update note',
    ADD_FAILED: 'Failed to add note'
};