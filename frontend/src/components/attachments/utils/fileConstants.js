// src/components/attachments/utils/fileConstants.js

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILES_PER_NOTE = 10;

// Allowed file types - expanded to include more types
export const ALLOWED_FILE_TYPES = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

    // Text
    'text/plain', 'text/markdown', 'text/csv', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml', 'text/xml',

    // Archives
    'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
    'application/x-tar', 'application/gzip', 'application/x-7z-compressed',

    // Code
    'application/javascript', 'application/typescript', 'application/x-python-code',
    'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++', 'text/x-ruby',

    // Logs
    'text/x-log', 'application/x-log',

    // Config files (often have generic types)
    'application/octet-stream', // Fallback for unknown types
    'text/yaml', 'application/x-yaml', 'text/x-yaml',
    'application/toml', 'application/x-toml',
    'text/x-ini', 'text/x-properties',

    // Additional common types
    'application/rtf', 'text/richtext',
    'application/vnd.oasis.opendocument.text', // .odt
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'application/vnd.oasis.opendocument.presentation', // .odp
];

// File type categories for icons/display
export const FILE_TYPE_CATEGORIES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
    pdf: ['application/pdf'],
    word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf'],
    excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    powerpoint: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    text: ['text/plain', 'text/markdown', 'text/html', 'text/css', 'text/javascript', 'application/json', 'application/xml', 'text/xml', 'text/x-log'],
    archive: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-7z-compressed'],
    code: ['application/javascript', 'application/typescript', 'application/x-python-code', 'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++', 'text/x-ruby'],
    config: ['text/yaml', 'application/x-yaml', 'application/toml', 'text/x-ini', 'text/x-properties', 'application/octet-stream'],
    other: []
};

// Validation functions
export const validateFile = (file) => {
    // Check size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File "${file.name}" exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
        };
    }

    // Check type - if type is in allowed list or if it's an octet-stream (fallback)
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== 'application/octet-stream') {
        return {
            valid: false,
            error: `File type "${file.type}" is not allowed for "${file.name}"`
        };
    }

    return { valid: true };
};

export const validateFiles = (files) => {
    const errors = [];
    for (let i = 0; i < files.length; i++) {
        const result = validateFile(files[i]);
        if (!result.valid) {
            errors.push(result.error);
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
};

// Helper to get file icon based on type
export const getFileIcon = (fileType) => {
    if (FILE_TYPE_CATEGORIES.image.includes(fileType)) return '🖼️';
    if (FILE_TYPE_CATEGORIES.pdf.includes(fileType)) return '📄';
    if (FILE_TYPE_CATEGORIES.word.includes(fileType)) return '📝';
    if (FILE_TYPE_CATEGORIES.excel.includes(fileType)) return '📊';
    if (FILE_TYPE_CATEGORIES.powerpoint.includes(fileType)) return '📽️';
    if (FILE_TYPE_CATEGORIES.archive.includes(fileType)) return '📦';
    if (FILE_TYPE_CATEGORIES.code.includes(fileType)) return '💻';
    if (FILE_TYPE_CATEGORIES.config.includes(fileType)) return '⚙️';
    if (FILE_TYPE_CATEGORIES.text.includes(fileType)) return '📃';
    return '📎';
};

// Format file size for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};