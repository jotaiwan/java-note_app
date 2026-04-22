/**
 * Get file icon based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {string} Emoji icon representing file type
 */
export const getFileIcon = (fileType) => {
    if (!fileType) return "📎";
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
        return "📊";
    if (
        fileType.includes("presentation") ||
        fileType.includes("powerpoint")
    )
        return "📽️";
    if (fileType.includes("zip") || fileType.includes("compressed"))
        return "🗜️";
    if (fileType.includes("text") || fileType.includes("txt")) return "📃";
    return "📎";
};

/**
 * Format file size for display
 * @param {number} kb - File size in kilobytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (kb) => {
    if (kb === 0) return "0 KB";
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};
