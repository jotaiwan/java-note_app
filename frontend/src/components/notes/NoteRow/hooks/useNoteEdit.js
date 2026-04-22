// src/components/notes/NoteRow/hooks/useNoteEdit.js
import { useState, useEffect, useRef } from 'react';

export function useNoteEdit({ note, onUpdateNote }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(note.note || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(true);

    const textareaRef = useRef(null);
    const emojiPickerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Focus textarea when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const handleUpdateClick = async () => {
        if (isEditing) {
            if (!onUpdateNote) {
                console.error('❌ No onUpdateNote handler provided');
                return;
            }

            setIsUpdating(true);
            try {
                await onUpdateNote(note.id, editedContent);
                setIsEditing(false);
                setShowEmojiPicker(false);
            } catch (error) {
                console.error('❌ Failed to update note:', error);
                alert(`Update failed: ${error.message || 'Unknown error'}`);
            } finally {
                setIsUpdating(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(note.note || '');
        setShowEmojiPicker(false);
    };

    const handleEmojiSelect = (emoji) => {
        insertTextAtCursor(emoji);
        setShowEmojiPicker(false);
    };

    const insertTextAtCursor = (text) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBefore = editedContent.substring(0, cursorPos);
        const textAfter = editedContent.substring(cursorPos);

        const newText = textBefore + text + textAfter;
        setEditedContent(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = cursorPos + text.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
    };

    return {
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
        handleEmojiSelect,
        insertTextAtCursor
    };
}