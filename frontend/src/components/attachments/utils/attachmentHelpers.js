import { FILE_TYPE_CATEGORIES } from "./constants";
import { getFileIcon } from "./fileHelpers";

/**
 * Create attachment object from File
 * @param {File} file - The file object
 * @param {number} index - Index for generating unique ID
 * @returns {Object} Attachment object
 */
export const createAttachmentFromFile = (file, index) => {
    const fileExt = file.name.split(".").pop() || "";
    const isImage = file.type?.startsWith("image/");

    return {
        id: `att_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        name: file.name,
        displayName: file.name,
        originalName: file.name,
        size: file.size,
        sizeKB: Math.round(file.size / 1024),
        type: file.type,
        fileType: file.type || "application/octet-stream",
        ext: fileExt,
        url: isImage ? URL.createObjectURL(file) : null,
        isImage: isImage,
        icon: getFileIcon(file.type),
    };
};

/**
 * Generate placeholders from attachments
 * @param {Array} attachments - Array of attachment objects
 * @returns {string} Space-separated placeholders
 */
export const generatePlaceholders = (attachments) => {
    return attachments.map((att) => `[${att.displayName}]`).join(" ");
};

/**
 * Remove placeholder from note text
 * @param {string} note - Current note text
 * @param {string} displayName - Display name to remove
 * @returns {string} Updated note text
 */
export const removePlaceholder = (note, displayName) => {
    const markerToRemove = `[${displayName}]`;
    return note.replace(markerToRemove, "").trim();
};

/**
 * Clean up attachment URLs
 * @param {Array} attachments - Array of attachment objects
 */
export const cleanupAttachmentUrls = (attachments) => {
    attachments.forEach((att) => {
        if (att.url) {
            URL.revokeObjectURL(att.url);
        }
    });
};

/**
 * Group attachments by type
 * @param {Array} attachments - Array of attachment objects
 * @returns {Object} Grouped attachments
 */
export const groupAttachmentsByType = (attachments) => {
    return attachments.reduce(
        (groups, att) => {
            if (att.isImage) {
                groups.images.push(att);
            } else {
                groups.files.push(att);
            }
            return groups;
        },
        { images: [], files: [] }
    );
};
