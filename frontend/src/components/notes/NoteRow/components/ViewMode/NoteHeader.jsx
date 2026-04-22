// src/components/notes/NoteRow/components/ViewMode/NoteHeader.jsx
import React from 'react';
import styles from './ViewMode.module.css';
import { formatDate, getRelativeTime, formatDateWithTimezonesCombined } from '../../../utils/dateHelper';

// Highlight occurrences of `term` in plain text, returning React nodes
function HighlightedText({ text, term }) {
    if (!term || !term.trim() || !text) return <>{text}</>;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === term.toLowerCase()
                    ? <mark key={i} className={styles.searchHighlight}>{part}</mark>
                    : part
            )}
        </>
    );
}

export function NoteHeader({
    note,
    isLatest,
    onUpdateClick,
    onCancelEdit,
    isEditing,
    isUpdating,
    totalAttachments,
    showTimeline = true,
    isExpanded,
    onToggleExpand,
    previewText,
    searchTerm = ''
}) {
    // Format date safely
    const formattedDate = formatDate(note.updatedAt);

    const handlePreviewClick = (e) => {
        e.stopPropagation();
        if (e.target.closest('button') || e.target.closest(`.${styles.infoBadge}`)) {
            return;
        }
        onToggleExpand();
    };

    // Handle copy with plain text
    const handleCopy = async () => {
        try {
            const plainText = note.note || note.content || '';
            await navigator.clipboard.writeText(plainText);

            // Show brief success feedback
            const button = document.activeElement;
            const originalTitle = button.title;
            button.title = 'Copied!';

            setTimeout(() => {
                button.title = originalTitle;
            }, 1500);

        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = note.note || note.content || '';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            } catch (fallbackError) {
                alert('Failed to copy to clipboard. Please select and copy manually.');
            }
        }
    };

    return (
        <div className={styles.contentHeader}>
            <div className={styles.headerRow}>
                {showTimeline && (
                    <div className={`${styles.timelineNode} ${isLatest ? styles.timelineNodeLatest : styles.timelineNodeOlder}`} />
                )}
                <div className={styles.noteInfoHeader}>
                    <div className={styles.leftBadges}>
                        <span className={`${styles.infoBadge} ${styles.idBadge}`}>
                            ID: {note.id}
                        </span>

                        {/* Collapse/Expand Icon */}
                        <button
                            className={styles.expandButton}
                            onClick={onToggleExpand}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <svg
                                className={styles.expandIcon}
                                width="18"
                                height="18"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                            >
                                {isExpanded ? (
                                    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                                ) : (
                                    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                )}
                            </svg>
                        </button>

                        <span className={`${styles.infoBadge} ${styles.dateBadge}`}>
                            {formatDateWithTimezonesCombined(
                                note.created_at || note.createdAt || note.timestamp,
                                {
                                    weekdayFormat: 'short',
                                    format: {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }
                                }
                            )}
                        </span>

                        {/* === CLICKABLE PREVIEW TEXT === */}
                        {previewText && (
                            <span
                                className={`${styles.headerPreview} ${styles.clickablePreview}`}
                                onClick={handlePreviewClick}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onToggleExpand();
                                    }
                                }}
                                title="Click to expand/collapse"
                            >
                                <HighlightedText
                                    text={previewText.length > 60 ? previewText.substring(0, 60) + '...' : previewText}
                                    term={searchTerm}
                                />
                            </span>
                        )}

                        {totalAttachments > 0 && (
                            <span className={`${styles.infoBadge} ${styles.attachmentsBadge}`}>
                                📎 {totalAttachments}
                            </span>
                        )}
                        {note.update && (
                            <span className={styles.infoBadge}>
                                Update
                            </span>
                        )}
                    </div>
                    <div className={styles.rightSection}>
                        <button
                            className={styles.copyButton}
                            onClick={handleCopy}
                            title="Copy note content"
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                            </svg>
                        </button>

                        {/* Edit mode buttons - Cancel on left, Save on right */}
                        {isEditing ? (
                            <>
                                <button
                                    className={`${styles.infoBadge} ${styles.cancelButton}`}
                                    onClick={onCancelEdit}
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`${styles.infoBadge} ${styles.saveButton}`}
                                    onClick={onUpdateClick}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button
                                className={`${styles.infoBadge} ${styles.updateButton}`}
                                onClick={onUpdateClick}
                                disabled={isUpdating}
                                title={!isLatest ? 'Only latest note can be updated' : ''}
                            >
                                Update
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}