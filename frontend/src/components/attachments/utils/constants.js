// Status options configuration
export const STATUS_OPTIONS = [
    { value: "Open", label: "Open", color: "#10B981" },
    { value: "Processing", label: "Processing", color: "#F59E0B" },
    { value: "Follow", label: "Follow", color: "#3B82F6" },
    { value: "Resolved", label: "Resolved", color: "#6B7280" },
];

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_NOTE = 10;

export const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json",
    "text/csv",
];

// File type categories for icons
export const FILE_TYPE_CATEGORIES = {
    image: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ],
    pdf: ["application/pdf"],
    word: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    excel: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    text: ["text/plain", "text/csv", "application/json"],
    archive: [
        "application/zip",
        "application/x-zip-compressed",
        "application/x-rar-compressed",
    ],
};
