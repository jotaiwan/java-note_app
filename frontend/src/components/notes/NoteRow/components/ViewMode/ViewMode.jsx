// src/components/notes/NoteRow/components/ViewMode/ViewMode.jsx
import React from 'react';
import TextRenderer from '../../../TextRenderer';
import styles from './ViewMode.module.css';
import { NoteHeader } from './NoteHeader';

export function Content({ noteContent, attachments = [], searchTerm = '' }) {
    return (
        <div className={styles.content}>
            <TextRenderer
                text={noteContent}
                attachments={attachments}
                searchTerm={searchTerm}
            />
        </div>
    );
}

export const ViewMode = {
    Header: NoteHeader,
    Content
};