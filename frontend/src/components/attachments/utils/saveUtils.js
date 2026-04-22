// src/components/attachments/utils/saveUtils.js
import { formatFileSize } from './fileConstants';

export const prepareUpdateFormData = ({
    newAttachments = [],
    images = [],
    imagePreviews = [],
    content = '',
    existingAttachmentIds = [],
    ticket = '',
    status = '',
    subject = ''
}) => {
    const formData = new FormData();

    // Core note fields
    formData.append('note', content);
    if (ticket) formData.append('ticket', ticket);
    if (status) formData.append('status', status);
    if (subject !== undefined) formData.append('subject', subject);

    // New file attachments (non-image files from useAttachments)
    newAttachments
        .map(att => att.file)
        .filter(Boolean)
        .forEach(file => formData.append('attachments[]', file));

    // Pasted/dropped images from useImageUpload
    images
        .map(img => img.file || img)
        .filter(f => f instanceof File)
        .forEach(file => formData.append('images[]', file));

    return formData;
};

export const prepareAddData = ({
    newAttachments = [],
    images = [],
    imagePreviews = [],
    note = '',
    subject = '',
    ticket = '',
    status = '',
    created = '',
    createdDisplay = ''
}) => {
    const fileAttachments = newAttachments
        .map(att => att.file)
        .filter(file => file instanceof File);

    const imageFiles = images.map(img => img.file || img).filter(file => file instanceof File);

    return {
        ticket: ticket.trim(),
        status,
        created,
        createdDisplay,
        note,
        subject,
        content: note,
        title: `Ticket ${ticket.trim()}`,
        attachments: [...fileAttachments, ...imageFiles],
        imageInfo: imagePreviews.map(img => ({
            displayName: img.displayName,
            filename: img.name,
            size: img.size,
            type: 'image',
            mimeType: img.type || 'image/png',
            sizeFormatted: formatFileSize(img.size)
        })),
        attachmentInfo: newAttachments.map(att => ({
            displayName: att.displayName,
            filename: att.originalName || att.name,
            originalName: att.originalName || att.name,
            size: att.size,
            type: 'file',
            fileType: att.fileType,
            ext: att.ext,
            sizeFormatted: formatFileSize(att.size)
        }))
    };
};

// eslint-disable-next-line no-unused-vars
export const logSaveData = (_type, _data) => {};
