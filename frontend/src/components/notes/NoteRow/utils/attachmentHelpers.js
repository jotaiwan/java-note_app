// utils/attachmentHelpers.js
export const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Date parse error:', e, dateString);
        return dateString;
    }
};

export const getAttachmentDisplayName = (attachment, index) => {
    if (attachment.originalFileName) return attachment.originalFileName;
    if (attachment.originalFilename) return attachment.originalFilename;
    if (attachment.displayName) return attachment.displayName;
    if (attachment.fileName) return attachment.fileName;
    return `attachment_${index + 1}`;
};