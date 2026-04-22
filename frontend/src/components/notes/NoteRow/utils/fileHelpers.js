// utils/fileHelpers.js
export const getFileIcon = (fileType = '', fileCategory = '') => {
    if (fileCategory === 'image' || fileType.startsWith('image/')) return '🖼️';
    if (fileCategory === 'video' || fileType.startsWith('video/')) return '🎬';
    if (fileCategory === 'audio' || fileType.startsWith('audio/')) return '🎵';
    if (fileCategory === 'pdf' || fileType.includes('pdf')) return '📄';
    if (fileCategory === 'document' || fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    if (fileType.includes('text') || fileType.includes('txt')) return '📃';
    return '📎';
};

export const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};