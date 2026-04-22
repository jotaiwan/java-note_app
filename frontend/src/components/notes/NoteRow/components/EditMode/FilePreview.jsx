// src/components/notes/NoteRow/components/EditMode/FilePreview.jsx
import React from 'react';
import styles from './EditMode.module.css';

const getFileIcon = (attachment) => {
    const fileType = attachment.fileType || attachment.type || '';
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    if (fileType.includes('text')) return '📃';
    return '📎';
};

export function FilePreview({ attachments, onRemove }) {
    const handleRemoveClick = (e, attachmentId) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to prevent attachment click
        onRemove(attachmentId);
    };

    return (
        <div className={styles.attachmentsPreview}>
            <div className={styles.attachmentsHeader}>
                <span className={styles.attachmentsTitle}>
                    📎 New Attachments ({attachments.length})
                </span>
                <small className={styles.attachmentsSubtitle}>
                    Files will be saved when you click Save
                </small>
            </div>

            <div className={styles.attachmentsGrid}>
                {attachments.map((att) => (
                    <div key={att.id} className={styles.attachmentItem}>
                        <div className={styles.attachmentPreviewContainer}>
                            {att.type?.startsWith('image/') ? (
                                <img
                                    src={att.url}
                                    alt={att.displayName}
                                    className={styles.imagePreview}
                                    onError={(e) => {
                                        console.error('Failed to load image:', att.name);
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="10">Image</text></svg>';
                                    }}
                                />
                            ) : (
                                <div className={styles.fileIconPreview}>
                                    <span className={styles.fileIcon}>{getFileIcon(att)}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => handleRemoveClick(e, att.id)}
                                className={styles.removeAttachmentButton}
                                title={`Remove ${att.name}`}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.attachmentInfo}>
                            <div className={styles.attachmentTitle}>
                                {att.displayName}
                            </div>
                            <div className={styles.attachmentDetails}>
                                <span className={styles.attachmentTime}>
                                    {att.time}
                                </span>
                                <span className={styles.attachmentSize}>
                                    {att.size}KB
                                </span>
                            </div>
                            <div className={styles.filename}>
                                <small>{att.name}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}