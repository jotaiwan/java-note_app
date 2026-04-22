// src/components/notes/NoteRow/components/Attachments/AttachmentGrid.jsx
import React from 'react';
import styles from './AttachmentGrid.module.css';

// Simple utility functions
const getFileIcon = (attachment) => {
    const fileType = attachment.fileType || attachment.mimeType || '';
    const fileCategory = attachment.fileCategory || '';

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

const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

const getAttachmentDisplayName = (attachment, index) => {
    if (attachment.originalFileName) return attachment.originalFileName;
    if (attachment.originalFilename) return attachment.originalFilename;
    if (attachment.displayName) return attachment.displayName;
    if (attachment.fileName) return attachment.fileName;
    return `attachment_${index + 1}`;
};

const AttachmentItem = ({ attachment, index, isLoaded, hasError, hasThumbnail, thumbnail, onClick }) => {
    const displayName = getAttachmentDisplayName(attachment, index);
    const isImage = attachment.fileCategory === 'image' || attachment.mimeType?.startsWith('image/');

    return (
        <div
            className={`${styles.attachmentHorizontalItem} ${isLoaded ? styles.attachmentLoaded : ''} ${hasError ? styles.attachmentError : ''}`}
            onClick={(e) => onClick(e, attachment, index)}
            title={isImage ? 'Click to view image' : 'Click to download file'}
        >
            <div className={styles.attachmentHorizontalContent}>
                <div className={styles.attachmentHorizontalPreview}>
                    {isImage && hasThumbnail ? (
                        <div className={styles.thumbnailHorizontalContainer}>
                            <img
                                src={thumbnail}
                                alt={displayName}
                                className={styles.thumbnailHorizontal}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                                draggable={false}
                            />
                        </div>
                    ) : (
                        <div className={styles.iconHorizontalContainer}>
                            <span className={styles.fileHorizontalIcon}>
                                {getFileIcon(attachment)}
                            </span>
                        </div>
                    )}

                    {attachment.id && !isLoaded && !hasError && (
                        <div className={styles.loadHorizontalIndicator}>
                            <span className={styles.loadHorizontalLoading}>●</span>
                        </div>
                    )}
                </div>

                <div className={styles.attachmentHorizontalInfo}>
                    <div className={styles.attachmentHorizontalName} title={displayName}>
                        {displayName}
                    </div>
                    <div className={styles.attachmentHorizontalMeta}>
                        <span className={styles.attachmentHorizontalType}>
                            {attachment.fileCategory || (attachment.mimeType?.split('/')[1] || '').toUpperCase()}
                        </span>
                        <span className={styles.attachmentHorizontalSize}>
                            {formatFileSize(attachment.fileSize)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function AttachmentGrid({
    attachments,
    loadedAttachments,
    attachmentLoadErrors,
    attachmentThumbnails,
    onAttachmentClick
}) {
    return (
        <div className={styles.noteAttachments}>
            <div className={styles.attachmentsHeader}>
                <span className={styles.attachmentsTitle}>
                    📎 Attachments ({attachments.length})
                </span>
                {attachments.length > 0 && (
                    <span className={styles.preloadStatus}>
                        {Object.keys(loadedAttachments).length > 0 &&
                            `(${Object.keys(loadedAttachments).length}/${attachments.length} ready)`
                        }
                    </span>
                )}
            </div>

            <div className={styles.attachmentsHorizontalGrid}>
                {attachments.map((attachment, index) => (
                    <AttachmentItem
                        key={attachment.id || index}
                        attachment={attachment}
                        index={index}
                        isLoaded={attachment.id && loadedAttachments[attachment.id]}
                        hasError={attachment.id && attachmentLoadErrors[attachment.id]}
                        hasThumbnail={attachment.id && attachmentThumbnails[attachment.id]}
                        thumbnail={attachmentThumbnails[attachment.id]}
                        onClick={onAttachmentClick}
                    />
                ))}
            </div>
        </div>
    );
}