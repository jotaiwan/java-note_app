// src/components/notes/NoteRow/hooks/useAttachmentPreload.js
import { useState, useEffect, useRef } from 'react';
import noteService from '../../../../service/noteService';

export function useAttachmentPreload({ note }) {
    const [loadedAttachments, setLoadedAttachments] = useState({});
    const [attachmentLoadErrors, setAttachmentLoadErrors] = useState({});
    const [attachmentThumbnails, setAttachmentThumbnails] = useState({});

    const preloadStartedRef = useRef({});

    useEffect(() => {
        if (!note || !note.attachments || note.attachments.length === 0) return;

        note.attachments.forEach((attachment) => {
            if (!attachment.id || preloadStartedRef.current[attachment.id]) return;

            preloadStartedRef.current[attachment.id] = true;

            if (attachment.fileCategory === 'image' || attachment.mimeType?.startsWith('image/')) {
                const attachmentUrl = noteService.getAttachmentUrl(attachment.id);
                const img = new Image();

                img.onload = () => {
                    setLoadedAttachments(prev => ({ ...prev, [attachment.id]: true }));

                    if (img.width > 0 && img.height > 0) {
                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const maxSize = 120;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
                            } else {
                                if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);

                            setAttachmentThumbnails(prev => ({
                                ...prev,
                                [attachment.id]: canvas.toDataURL('image/jpeg', 0.7)
                            }));
                        } catch (error) {
                            console.error('Error creating thumbnail:', error);
                        }
                    }
                };

                img.onerror = () => {
                    setAttachmentLoadErrors(prev => ({ ...prev, [attachment.id]: true }));
                };

                img.src = attachmentUrl;
            } else {
                setLoadedAttachments(prev => ({ ...prev, [attachment.id]: true }));
            }
        });
    }, [note]);

    return { loadedAttachments, attachmentLoadErrors, attachmentThumbnails };
}
