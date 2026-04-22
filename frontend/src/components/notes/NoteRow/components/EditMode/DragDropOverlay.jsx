// components/EditMode/DragDropOverlay.jsx
import React from 'react';
import styles from './EditMode.module.css'; // This file needs to be created

export function DragDropOverlay({ isActive }) {
    if (!isActive) return null;

    return (
        <div className={styles.dragOverlay}>
            <div className={styles.dragMessage}>
                📁 Drop files anywhere to attach
            </div>
        </div>
    );
}