// frontend/src/components/emoji/EmojiTextArea.jsx
import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import styles from './EmojiTextArea.module.css';

export default function EmojiTextArea({
    value,
    onChange,
    placeholder = 'Enter emoji content here...',
    rows = 5,
    ...props
}) {
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);

    // Get current cursor poition
    const handleTextareaClick = () => {
        if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
        }
    };

    const handleTextareaKeyUp = () => {
        if (textareaRef.current) {
            setCursorPosition(textareaRef.current.selectionStart);
        }
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        if (!textareaRef.current) return;

        const text = value || '';
        const before = text.slice(0, cursorPosition);
        const after = text.slice(cursorPosition);

        const newText = before + emoji + after;

        // Update content
        if (onChange) {
            onChange(newText);
        }

        // Update cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = cursorPosition + emoji.length;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                setCursorPosition(newCursorPos);
            }
        }, 0);
    };

    return (
        <div className={styles.container}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onClick={handleTextareaClick}
                onKeyUp={handleTextareaKeyUp}
                onMouseUp={handleTextareaClick}
                placeholder={placeholder}
                rows={rows}
                className={styles.textarea}
                {...props}
            />
            <div className={styles.emojiPickerWrapper}>
                <EmojiPicker onSelect={handleEmojiSelect} position="top" />
            </div>
        </div>
    );
}