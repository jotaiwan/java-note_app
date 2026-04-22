// src/components/notes/NoteRow/components/EditMode/EditMode.jsx
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { EmojiPicker } from '../../../../emoji';
import styles from './EditMode.module.css';
import FilePreview from '../../../../attachments/FilePreview';
import { groupAttachmentsByType } from '../../../../attachments/utils/attachmentHelpers';
import DateTimePicker from '../../../../shared/DateTimePicker/DateTimePicker';

export function EditMode({
    editedContent,
    setEditedContent,
    isUpdating,
    showEmojiPicker,
    setShowEmojiPicker,
    newAttachments,
    imagePreviews,
    textareaRef,
    emojiPickerRef,
    fileInputRef,
    onEmojiSelect,
    onFileSelect,
    onFilePaste,
    onRemoveAttachment,
    onAttachButtonClick,
    onSave,
    onCancel,
    editedDate,
    onDateChange
}) {

    const [showDatePicker, setShowDatePicker] = useState(false);

    // Refs to track cursor position and scroll position
    const lastCursorPosRef = useRef(0);
    const lastScrollTopRef = useRef(0);

    // Auto-resize textarea based on content
    const autoResizeTextarea = useCallback(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const newHeight = Math.min(
                Math.max(textarea.scrollHeight, 100),
                600
            );
            textarea.style.height = newHeight + 'px';
            if (lastScrollTopRef.current > 0) {
                textarea.scrollTop = lastScrollTopRef.current;
            }
        }
    }, [textareaRef]);

    // Auto-resize whenever content changes
    useEffect(() => {
        autoResizeTextarea();
    }, [editedContent, autoResizeTextarea]);

    const handleContainerClick = (e) => {
        e.stopPropagation();
    };

    const handleAttachClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAttachButtonClick();
    };

    // Save cursor position and scroll position
    const saveTextareaState = () => {
        if (textareaRef.current) {
            lastCursorPosRef.current = textareaRef.current.selectionStart;
            lastScrollTopRef.current = textareaRef.current.scrollTop;
        }
    };

    const handleTextareaClick = () => {
        saveTextareaState();
    };

    const handleTextareaKeyUp = () => {
        saveTextareaState();
    };

    const handleTextareaScroll = () => {
        if (textareaRef.current) {
            lastScrollTopRef.current = textareaRef.current.scrollTop;
        }
    };

    const handleEmojiSelect = useCallback((emoji) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const currentScrollTop = textarea.scrollTop;
        lastScrollTopRef.current = currentScrollTop;
        const cursorPos = textarea.selectionStart;

        const newText =
            editedContent.substring(0, cursorPos) +
            emoji +
            editedContent.substring(cursorPos);

        setEditedContent(newText);

        setTimeout(() => {
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                const newCursorPos = cursorPos + emoji.length;
                textarea.focus();
                textarea.selectionStart = newCursorPos;
                textarea.selectionEnd = newCursorPos;
                textarea.scrollTop = lastScrollTopRef.current;
                lastCursorPosRef.current = newCursorPos;
                autoResizeTextarea();
            }
        }, 0);
    }, [editedContent, setEditedContent, textareaRef, autoResizeTextarea]);

    const groupedAttachments = groupAttachmentsByType(newAttachments || []);

    // Merge pasted images (imagePreviews) with image attachments from file picker
    const allImagePreviews = [
        ...(imagePreviews || []),
        ...groupedAttachments.images,
    ];

    return (
        <div className={styles.editMode} onClick={handleContainerClick}>
            <div className={styles.editHeader}>
                <div className={styles.textareaHeader}>
                    <span className={styles.editLabel}>Edit Note:</span>
                    {editedDate && onDateChange ? (
                        <DateTimePicker
                            value={editedDate}
                            onChange={onDateChange}
                            showPicker={showDatePicker}
                            onShowPickerChange={setShowDatePicker}
                        />
                    ) : editedDate ? (
                        <span className={styles.editDate}>
                            {editedDate}
                        </span>
                    ) : null}
                </div>
                <div className={styles.editActions}>
                    <div
                        ref={emojiPickerRef}
                        className={styles.emojiPickerInline}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EmojiPicker
                            onSelect={handleEmojiSelect}
                            position="bottom-left"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAttachClick}
                        className={styles.attachButton}
                        title="Attach files (images, PDFs, Word, etc.)"
                    >
                        📎 Attach Files
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileSelect}
                        style={{ display: 'none' }}
                    />
                    <span className={styles.imageHint}>
                        (Drag & drop files anywhere or Ctrl+V to paste)
                    </span>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onClick={handleTextareaClick}
                onKeyUp={handleTextareaKeyUp}
                onScroll={handleTextareaScroll}
                onPaste={onFilePaste}
                className={styles.editTextarea}
                placeholder="Edit your note here... (Drag & drop files or Ctrl+V to paste)"
                disabled={isUpdating}
            />

            {(allImagePreviews.length > 0 || groupedAttachments.files?.length > 0) && (
                <div className={styles.previewSection}>
                    <FilePreview
                        images={allImagePreviews}
                        files={groupedAttachments.files || []}
                        onRemove={onRemoveAttachment}
                    />
                </div>
            )}

            <div className={styles.editActionBar}>
                <button
                    className={`${styles.editActionButton} ${styles.cancelButton}`}
                    onClick={onCancel}
                    disabled={isUpdating}
                >
                    Cancel
                </button>
                <button
                    className={`${styles.editActionButton} ${styles.saveButton}`}
                    onClick={onSave}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className={styles.editFooter}>
                <span className={styles.charCount}>
                    {editedContent.length} characters
                </span>
                {isUpdating && (
                    <span className={styles.updatingIndicator}>
                        <span className={styles.spinner}></span> Saving...
                    </span>
                )}
            </div>
        </div>
    );
}