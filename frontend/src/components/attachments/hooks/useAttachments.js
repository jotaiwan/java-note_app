import { useState, useCallback } from "react";

export default function useAttachments(note, setNote) {
    const [attachments, setAttachments] = useState([]);

    const processFiles = useCallback((files) => {
        if (!files) return;

        let fileArray = [];
        if (files instanceof FileList) {
            fileArray = Array.from(files);
        } else if (Array.isArray(files)) {
            fileArray = files;
        } else {
            return;
        }

        const newAttachments = fileArray.map((file, index) => {
            const fileExt = file.name.split(".").pop() || "";
            const isImage = file.type?.startsWith("image/");
            return {
                id: `att_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
                file,
                name: file.name,
                displayName: file.name,
                originalName: file.name,
                size: file.size,
                sizeKB: Math.round(file.size / 1024),
                type: file.type,
                fileType: file.type || "application/octet-stream",
                ext: fileExt,
                url: isImage ? URL.createObjectURL(file) : null,
                isImage,
            };
        });

        setAttachments((current) => [...current, ...newAttachments]);

        // Use functional update to avoid stale closure on setNote
        const placeholders = newAttachments.map((att) => `[${att.displayName}]`).join(" ");
        setNote((prev) => prev + (prev ? " " : "") + placeholders);
    }, [setNote]);

    const removeAttachment = useCallback((attachmentId) => {
        setAttachments((prev) => {
            const attachment = prev.find((a) => a.id === attachmentId);
            if (attachment) {
                setNote((prevNote) => prevNote.replace(`[${attachment.displayName}]`, "").trim());
                if (attachment.url) URL.revokeObjectURL(attachment.url);
            }
            return prev.filter((a) => a.id !== attachmentId);
        });
    }, [setNote]);

    const clearAllAttachments = useCallback(() => {
        setAttachments((prev) => {
            prev.forEach((att) => { if (att.url) URL.revokeObjectURL(att.url); });
            return [];
        });
    }, []);

    return { attachments, processFiles, removeAttachment, clearAllAttachments };
}
