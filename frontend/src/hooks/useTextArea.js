// frontend/src/hooks/useTextArea.js
import { useState, useRef, useCallback } from 'react';

export function useTextArea(initialValue = '') {
    const [value, setValue] = useState(initialValue);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);

    const handleChange = useCallback((e) => {
        setValue(e.target.value);
    }, []);

    const handleClick = useCallback(() => {
        if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
        }
    }, []);

    const handleKeyUp = useCallback(() => {
        if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
        }
    }, []);

    // Insert text at cursor position
    const insertTextAtCursor = useCallback((textToInsert) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = value.substring(0, start) + textToInsert + value.substring(end);

        setValue(newText);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + textToInsert.length;
            textarea.setSelectionRange(newPos, newPos);
            setCursorPosition(newPos);
        }, 0);
    }, [value]);

    // Insert emoji at cursor
    const insertEmoji = useCallback((emoji) => {
        if (!textareaRef.current) return;

        const before = value.slice(0, cursorPosition);
        const after = value.slice(cursorPosition);
        const newText = before + emoji + after;

        setValue(newText);

        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = cursorPosition + emoji.length;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                setCursorPosition(newCursorPos);
            }
        }, 0);
    }, [value, cursorPosition]);

    const reset = useCallback(() => {
        setValue('');
        setCursorPosition(0);
    }, []);

    return {
        value,
        setValue,
        cursorPosition,
        textareaRef,
        handleChange,
        handleClick,
        handleKeyUp,
        insertTextAtCursor,
        insertEmoji,
        reset
    };
}