import React from "react";
import styles from "./DragDropOverlay.module.css";

export default function DragDropOverlay({ isDragging }) {
    if (!isDragging) return null;

    return (
        <div className={styles.dragOverlay}>
            <div className={styles.dragMessage}>
                📁 Drop files anywhere to attach
            </div>
        </div>
    );
}
