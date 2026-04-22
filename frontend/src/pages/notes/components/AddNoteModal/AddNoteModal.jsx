// src/pages/notes/components/AddNoteModal/AddNoteModal.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, useTextArea } from '../../../../hooks';

// Import shared attachment components
import {
    useAttachments,
    useDragAndDrop,
    useFileUpload,
    DragDropOverlay,
    FilePreview
} from '../../../../components/attachments';
import { groupAttachmentsByType } from '../../../../components/attachments/utils/attachmentHelpers';

// Import the new combined hook
import { useAttachmentUpload } from '../../../../hooks/useAttachmentUpload';
import noteService from '../../../../service/noteService'; // ADDED: Import noteService

// Import local components
import StatusButtons from './components/StatusButtons';
import DateTimePicker from '../../../../components/shared/DateTimePicker/DateTimePicker';
import NoteTextArea from './components/NoteTextArea';

// Import utils
import { getCurrentDateTimeDisplay, formatDateTimeForSubmission } from './utils/dateUtils';
import { prepareAddData, logSaveData } from '../../../../components/attachments/utils/saveUtils';
import { ATTACHMENT_ERRORS } from '../../../../components/attachments/utils/errorMessages';

import styles from './AddNoteModal.module.css';

export default function AddNoteModal({ isOpen, onClose, onAddNote, ticketNumber = '' }) {
    const [latestStatus, setLatestStatus] = useState('');
    const [createdDateTime, setCreatedDateTime] = useState(getCurrentDateTimeDisplay());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoadingSubject, setIsLoadingSubject] = useState(false); // ADDED: Loading state

    // Refs to track cursor position and scroll position
    const lastCursorPosRef = useRef(0);
    const lastScrollTopRef = useRef(0);

    // Custom hooks
    const form = useForm({
        ticket: ticketNumber || '',
        status: '',
        note: '',
        subject: '' // ADDED: subject field
    });

    const {
        value: note,
        setValue: setNote,
        textareaRef,
        handleChange: handleNoteChange,
        handleClick: handleTextareaClick,
        handleKeyUp: handleTextareaKeyUp,
        insertTextAtCursor,
        insertEmoji
    } = useTextArea('');

    // ADDED: Auto-retrieve subject when ticket exists
    useEffect(() => {
        const fetchLatestSubject = async () => {
            const ticket = form.values.ticket.trim();
            if (!ticket) return;

            setIsLoadingSubject(true);
            try {
                const response = await noteService.searchNotes(ticket);
                if (response.success && response.data && response.data.length > 0) {
                    const notes = response.data.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    const noteWithSubject = notes.find(note =>
                        note.subject && note.subject.trim() !== ''
                    );
                    if (noteWithSubject) {
                        form.setFieldValue('subject', noteWithSubject.subject);
                    }
                }
            } catch (error) {
                console.error('Error fetching subject:', error);
            } finally {
                setIsLoadingSubject(false);
            }
        };

        const timer = setTimeout(fetchLatestSubject, 500);
        return () => clearTimeout(timer);
    }, [form.values.ticket]);

    // Save textarea state (cursor position and scroll position)
    const saveTextareaState = useCallback(() => {
        if (textareaRef.current) {
            lastCursorPosRef.current = textareaRef.current.selectionStart;
            lastScrollTopRef.current = textareaRef.current.scrollTop;
        }
    }, [textareaRef]);

    // Restore textarea state (cursor position and scroll position)
    const restoreTextareaState = useCallback(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;

            // Restore cursor position
            textarea.focus();
            textarea.selectionStart = lastCursorPosRef.current;
            textarea.selectionEnd = lastCursorPosRef.current;

            // Restore scroll position
            textarea.scrollTop = lastScrollTopRef.current;
        }
    }, [textareaRef]);

    // Save scroll position when scrolling
    const handleTextareaScroll = useCallback(() => {
        if (textareaRef.current) {
            lastScrollTopRef.current = textareaRef.current.scrollTop;
        }
    }, [textareaRef]);

    // Custom emoji handler - maintains scroll position
    const handleEmojiSelect = useCallback((emoji) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;

        // Save current scroll position
        const currentScrollTop = textarea.scrollTop;
        lastScrollTopRef.current = currentScrollTop;

        // Get cursor position
        const cursorPos = textarea.selectionStart;

        // Insert emoji at cursor position
        const newText =
            note.substring(0, cursorPos) +
            emoji +
            note.substring(cursorPos);

        setNote(newText);

        // Restore state in next event loop
        setTimeout(() => {
            if (textareaRef.current) {
                const textarea = textareaRef.current;

                // Set new cursor position
                const newCursorPos = cursorPos + emoji.length;
                textarea.focus();
                textarea.selectionStart = newCursorPos;
                textarea.selectionEnd = newCursorPos;

                // Restore scroll position
                textarea.scrollTop = lastScrollTopRef.current;

                // Update ref
                lastCursorPosRef.current = newCursorPos;
            }
        }, 0);
    }, [note, setNote, textareaRef]);

    // Use the new combined hook
    const {
        images,
        imagePreviews,
        attachments,
        fileInputRef,
        openFileDialog,
        handleFileSelect,
        handlePaste,
        handleRemove,
        handleDrop,
        clearAll
    } = useAttachmentUpload(note, setNote, {
        onImagePasted: (placeholder) => {
            insertTextAtCursor(placeholder);
        },
        onImageRemoved: (displayName) => {
            const markerToRemove = `[${displayName}]`;
            setNote(prev => prev.replace(markerToRemove, '').trim());
        }
    });

    const { isDragging, dropAreaRef } = useDragAndDrop({
        onDrop: (droppedFiles) => {
            const success = handleDrop(droppedFiles);
            if (!success) {
                // Error already shown in hook
                return;
            }
        },
        enabled: isOpen
    });

    // Update ticket field when ticketNumber prop changes
    useEffect(() => {
        if (ticketNumber) {
            form.setFieldValue('ticket', ticketNumber);
        }
    }, [ticketNumber]);

    // Fetch latest status
    useEffect(() => {
        if (form.values.ticket.trim()) {
            setLatestStatus('Processing');
        }
    }, [form.values.ticket]);

    // Group attachments for FilePreview
    const groupedAttachments = groupAttachmentsByType(attachments);

    // Merge pasted images with image attachments from file picker
    const allImagePreviews = [...imagePreviews, ...groupedAttachments.images];

    /**
     * Test function
     */
    const addTestFile = () => {
        const mockFile = new File(
            ['test content'],
            `test-${Date.now()}.json`,
            { type: 'application/json' }
        );
        const success = handleDrop([mockFile]);
    };

    /**
     * Handle submit
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.values.ticket.trim()) {
            alert(ATTACHMENT_ERRORS.TICKET_REQUIRED);
            return;
        }

        if (!note.trim()) {
            alert(ATTACHMENT_ERRORS.CONTENT_REQUIRED);
            return;
        }

        const finalStatus = form.values.status || latestStatus || 'Open';
        const formattedDateTime = formatDateTimeForSubmission(createdDateTime);

        // Use shared utility to prepare data
        const submitData = prepareAddData({
            newAttachments: attachments,
            images: images,
            imagePreviews: imagePreviews,
            note: note,
            subject: form.values.subject, // ADDED: subject field
            ticket: form.values.ticket,
            status: finalStatus,
            created: formattedDateTime,
            createdDisplay: createdDateTime
        });

        logSaveData('ADD', {
            newAttachments: attachments,
            images: images,
            imagePreviews: imagePreviews,
            content: note
        });

        if (onAddNote) {
            try {
                await onAddNote(submitData);

                // Reset form
                form.resetForm();
                setNote('');
                clearAll();
                setCreatedDateTime(getCurrentDateTimeDisplay());
                onClose();
            } catch (error) {
                console.error('❌ Add failed:', error);
                alert(ATTACHMENT_ERRORS.ADD_FAILED);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onMouseDown={(e) => {
                // Only close if clicking directly on overlay (not on modal content)
                // and not during text selection
                if (e.target === e.currentTarget) {
                    const selection = window.getSelection();
                    if (!selection.toString()) {
                        onClose();
                    }
                }
            }}
        >
            <div
                className={styles.modalContent}
                onMouseDown={(e) => e.stopPropagation()} // Prevent mouse down from reaching overlay
                ref={dropAreaRef}
            >
                <div className={styles.modalHeader}>
                    <h2>Add New Note</h2>
                    <div className={styles.headerActions}>
                        <button type="button" onClick={onClose} className={styles.headerCancelBtn}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="noteForm"
                            className={styles.headerSubmitBtn}
                            disabled={!form.values.ticket.trim() || !note.trim()}
                        >
                            Add Note
                        </button>
                    </div>
                </div>

                <DragDropOverlay isDragging={isDragging} />

                <form id="noteForm" onSubmit={handleSubmit}>
                    <div className={styles.compactRowGroup}>
                        <div className={styles.compactRowItem} style={{ flex: 1 }}>
                            <label htmlFor="ticket">Ticket *</label>
                            <input
                                id="ticket"
                                name="ticket"
                                type="text"
                                value={form.values.ticket}
                                onChange={form.handleChange}
                                placeholder="Ticket Number *"
                                className={styles.compactInput}
                                required
                                autoFocus
                            />
                        </div>

                        {/* ADDED: Subject field */}
                        <div className={styles.compactRowItem} style={{ flex: 2 }}>
                            <label htmlFor="subject">
                                Subject
                                {isLoadingSubject && <span style={{ marginLeft: 4 }}>⏳</span>}
                            </label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={form.values.subject}
                                onChange={form.handleChange}
                                placeholder={isLoadingSubject ? "Loading..." : "Subject"}
                                className={styles.compactInput}
                            />
                        </div>

                        <div className={styles.compactRowItem} style={{ flex: 1 }}>
                            <label htmlFor="created">Created</label>
                            <DateTimePicker
                                value={createdDateTime}
                                onChange={setCreatedDateTime}
                                showPicker={showDatePicker}
                                onShowPickerChange={setShowDatePicker}
                            />
                        </div>
                    </div>

                    <StatusButtons
                        selectedStatus={form.values.status}
                        onStatusChange={(value) => form.setFieldValue('status', value)}
                        ticketNumber={form.values.ticket}
                    />

                    <NoteTextArea
                        value={note}
                        onChange={handleNoteChange}
                        onClick={handleTextareaClick}
                        onKeyUp={handleTextareaKeyUp}
                        onScroll={handleTextareaScroll}
                        onPaste={handlePaste}
                        onEmojiSelect={handleEmojiSelect}
                        onAttachButtonClick={openFileDialog}
                        onFileSelect={handleFileSelect}
                        onTestClick={addTestFile}
                        isDragging={isDragging}
                        textareaRef={textareaRef}
                        fileInputRef={fileInputRef}
                    />

                    <FilePreview
                        images={allImagePreviews}
                        files={groupedAttachments.files}
                        onRemove={handleRemove}
                    />
                </form>
            </div>
        </div>
    );
}