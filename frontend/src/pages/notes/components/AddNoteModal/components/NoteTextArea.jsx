import React from 'react';
import { EmojiPicker } from '../../../../../components/emoji';
import styles from '../AddNoteModal.module.css';

export default function NoteTextArea({
    value,
    onChange,
    onClick,
    onKeyUp,
    onPaste,
    onEmojiSelect,
    onAttachButtonClick,
    onFileSelect,
    onTestClick,
    isDragging,
    textareaRef,
    fileInputRef
}) {
    return (
        <div className={styles.compactFormGroup}>
            <div className={styles.textareaHeader}>
                <label htmlFor="note">
                    Comment *
                    <span className={styles.imageHint}>(Drag & drop files)</span>
                </label>
                <div className={styles.uploadActions}>
                    <button
                        type="button"
                        onClick={onAttachButtonClick}
                        className={styles.attachButton}
                    >
                        📎 Attach Files
                    </button>
                    <button
                        type="button"
                        onClick={onTestClick}
                        style={{
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        🧪 Test File
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileSelect}
                        style={{ display: 'none' }}
                    />
                    <div className={styles.inlineEmojiPicker}>
                        <EmojiPicker onSelect={onEmojiSelect} position="top-left" />
                    </div>
                </div>
            </div>

            <textarea
                ref={textareaRef}
                id="note"
                value={value}
                onChange={onChange}
                onClick={onClick}
                onKeyUp={onKeyUp}
                onPaste={onPaste}  // This should be here
                placeholder="Write your comment here..."
                className={`${styles.compactTextarea} ${isDragging ? styles.textareaDragging : ''}`}
                rows={8}
                required
            />
        </div>
    );
}