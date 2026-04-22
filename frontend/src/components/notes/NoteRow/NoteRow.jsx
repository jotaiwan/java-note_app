// src/components/notes/NoteRow/NoteRow.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './NoteRow.module.css';
import noteService from '../../../service/noteService';

// Import SHARED hooks and components
import { useAttachments, useDragAndDrop, useFileUpload } from '../../attachments';
import DragDropOverlay from '../../attachments/DragDropOverlay';

// Import the new combined hook
import { useAttachmentUpload } from '../../../hooks/useAttachmentUpload';

// Import saveUtils
import { prepareUpdateFormData, logSaveData } from '../../attachments/utils/saveUtils';
import { ATTACHMENT_ERRORS } from '../../attachments/utils/errorMessages';

// Hooks
import { useNoteEdit, useAttachmentPreload } from './hooks';

// Components
import { ViewMode } from './components/ViewMode';
import { EditMode } from './components/EditMode';
import { AttachmentGrid } from './components/Attachments';

export default function NoteRow({
    note,
    isLatest = false,
    showTimeline = true,
    onUpdateNote,
    isNoteExpanded = false,
    searchTerm = ''
}) {
    const [isExpanded, setIsExpanded] = useState(isNoteExpanded || !!searchTerm);

    useEffect(() => {
        if (isNoteExpanded) {
            setIsExpanded(true);

            // Auto-collapse after 3 seconds
            const timer = setTimeout(() => {
                setIsExpanded(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isNoteExpanded]);

    const [editedDate, setEditedDate] = useState(note?.created_at || note?.createdAt || null);

    // Custom hooks
    const {
        isEditing,
        setIsEditing,
        editedContent,
        setEditedContent,
        isUpdating,
        setIsUpdating,
        showEmojiPicker,
        setShowEmojiPicker,
        textareaRef,
        emojiPickerRef,
        handleUpdateClick,
        handleCancelEdit,
        handleEmojiSelect
    } = useNoteEdit({ note, onUpdateNote });

    // Auto-resize textarea when in edit mode and content changes
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            const textarea = textareaRef.current;

            // Reset height to auto to get correct scrollHeight
            textarea.style.height = 'auto';

            // Calculate new height (with min and max limits)
            const scrollHeight = textarea.scrollHeight;
            const minHeight = 100;  // Minimum height
            const maxHeight = 600;  // Maximum height

            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

            // Apply new height
            textarea.style.height = newHeight + 'px';
        }
    }, [editedContent, isEditing, textareaRef]);

    // Use the new combined hook
    const {
        images,
        imagePreviews,
        attachments: newAttachments,
        fileInputRef,
        openFileDialog,
        handleFileSelect,
        handlePaste,
        handleRemove,
        handleDrop,
        clearAll
    } = useAttachmentUpload(editedContent, setEditedContent, {
        onImagePasted: (placeholder) => {
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newText = editedContent.substring(0, start) + placeholder + editedContent.substring(end);
                setEditedContent(newText);

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
                    textarea.focus();
                }, 0);
            }
        },
        onImageRemoved: (displayName) => {
            const markerToRemove = `[${displayName}]`;
            setEditedContent(prev => prev.replace(markerToRemove, '').trim());
        }
    });

    const { isDragging, dropAreaRef: editContainerRef } = useDragAndDrop({
        onDrop: (droppedFiles) => {
            const success = handleDrop(droppedFiles);
            if (!success) {
                // Error already shown in hook
                return;
            }
        },
        enabled: isEditing
    });

    const {
        loadedAttachments,
        attachmentLoadErrors,
        attachmentThumbnails
    } = useAttachmentPreload({ note });

    const handleDateChange = (newDate) => {
        setEditedDate(newDate);
    };

    // Handle save with attachments
    const handleSave = async () => {
        if (!onUpdateNote) {
            console.error('❌ No onUpdateNote handler provided');
            return;
        }

        setIsUpdating(true);
        try {
            // Use shared utility to prepare FormData — include all note fields
            const formData = prepareUpdateFormData({
                newAttachments,
                images,
                imagePreviews,
                content: editedContent,
                ticket: note.ticket || '',
                status: note.status || '',
                subject: note.subject || ''
            });

            if (editedDate) {
                formData.append('created', editedDate);
            }

            // Call onUpdateNote with the note ID and formData
            await onUpdateNote(note.id, formData);

            // Exit edit mode
            setIsEditing(false);
            setShowEmojiPicker(false);

            // Clean up
            clearAll();

        } catch (error) {
            console.error('❌ Failed to update note:', error);
            alert(ATTACHMENT_ERRORS.UPDATE_FAILED);
        } finally {
            setIsUpdating(false);
        }
    };

    // Override the handleUpdateClick from useNoteEdit
    const onUpdateClick = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
        }
    };

    // Handle cancel
    const onCancel = () => {
        setIsEditing(false);
        setEditedContent(note.note || '');
        setEditedDate(note.created_at || note.createdAt || null); // Reset date
        setShowEmojiPicker(false);
        clearAll();
    };

    // Handle toggle expand
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Early return if note is invalid
    if (!note || typeof note !== 'object') {
        return (
            <div className={styles.noteRow}>
                <div className={styles.noteContent}>
                    <div className={styles.errorContainer}>
                        Error: Invalid note data
                    </div>
                </div>
            </div>
        );
    }

    const {
        note: noteContent = 'No content',
        createdAt,
        attachments = []
    } = note;

    const hasAttachments = attachments && attachments.length > 0;

    // Handle attachment click
    const handleAttachmentClick = (e, attachment, index) => {
        e.preventDefault();
        e.stopPropagation();

        if (isEditing) return;

        const attachmentUrl = noteService.getAttachmentUrl(attachment.id);
        const isImage = attachment.fileCategory === 'image' || attachment.mimeType?.startsWith('image/');

        if (isImage) {
            window.open(attachmentUrl, '_blank', 'noopener,noreferrer');
        } else {
            noteService.downloadAttachment(
                attachment.id,
                attachment.originalFilename || attachment.fileName || `file-${attachment.id}`
            );
        }
    };

    return (
        <div className={`${styles.noteRow} ${isEditing ? styles.editModeActive : ''}`}>
            <div className={`${styles.noteContent} ${isLatest ? styles.noteContentLatest : ''}`}>

                {/* Header with timeline node and expand/collapse button */}
                <ViewMode.Header
                    note={note}
                    isLatest={isLatest}
                    showTimeline={showTimeline}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    onUpdateClick={onUpdateClick}
                    onCancelEdit={onCancel}
                    totalAttachments={attachments?.length || 0}
                    isExpanded={isExpanded}
                    onToggleExpand={handleToggleExpand}
                    previewText={!isExpanded && !isEditing ? noteContent : null}
                    searchTerm={searchTerm}
                />

                {/* Note content area - only show when expanded OR in edit mode */}
                {(isExpanded || isEditing) && (
                    <>
                        {isEditing ? (
                            <div ref={editContainerRef} className={styles.editModeContainer}>
                                <DragDropOverlay isDragging={isDragging} />

                                <EditMode
                                    editedContent={editedContent}
                                    setEditedContent={setEditedContent}
                                    isUpdating={isUpdating}
                                    showEmojiPicker={showEmojiPicker}
                                    setShowEmojiPicker={setShowEmojiPicker}
                                    newAttachments={newAttachments}
                                    imagePreviews={imagePreviews}
                                    textareaRef={textareaRef}
                                    emojiPickerRef={emojiPickerRef}
                                    fileInputRef={fileInputRef}
                                    onEmojiSelect={handleEmojiSelect}
                                    onFileSelect={handleFileSelect}
                                    onFilePaste={handlePaste}
                                    onRemoveAttachment={handleRemove}
                                    onAttachButtonClick={openFileDialog}
                                    onSave={handleSave}
                                    onCancel={onCancel}
                                    editedDate={editedDate}
                                    onDateChange={handleDateChange}
                                />
                            </div>
                        ) : (
                            <ViewMode.Content
                                noteContent={noteContent}
                                attachments={attachments}
                                searchTerm={searchTerm}
                            />
                        )}

                        {/* Existing attachments display - only show when expanded */}
                        {hasAttachments && isExpanded && (
                            <AttachmentGrid
                                attachments={attachments}
                                loadedAttachments={loadedAttachments}
                                attachmentLoadErrors={attachmentLoadErrors}
                                attachmentThumbnails={attachmentThumbnails}
                                onAttachmentClick={handleAttachmentClick}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}