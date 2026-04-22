import React, { useRef, useEffect } from 'react';
import { displayToDateTimeLocal, dateTimeLocalToDisplay } from '../utils/dateUtils';
import styles from '../AddNoteModal.module.css';

export default function DateTimePicker({ value, onChange, showPicker, onShowPickerChange }) {
    const datePickerRef = useRef(null);
    const hiddenInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                onShowPickerChange(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onShowPickerChange]);

    const handleDisplayInputClick = () => {
        onShowPickerChange(true);
        setTimeout(() => {
            hiddenInputRef.current?.showPicker?.();
        }, 10);
    };

    const handleHiddenDateTimeChange = (e) => {
        if (e.target.value) {
            onChange(dateTimeLocalToDisplay(e.target.value));
        }
        onShowPickerChange(false);
    };

    return (
        <div className={styles.customDateTimeContainer} ref={datePickerRef}>
            <input
                type="text"
                value={value}
                onClick={handleDisplayInputClick}
                readOnly
                className={styles.compactDateTimeInput}
            />
            <input
                ref={hiddenInputRef}
                type="datetime-local"
                value={displayToDateTimeLocal(value)}
                onChange={handleHiddenDateTimeChange}
                className={styles.hiddenDateTimeInput}
                style={{
                    position: 'absolute',
                    visibility: showPicker ? 'visible' : 'hidden',
                    opacity: 0,
                    pointerEvents: showPicker ? 'auto' : 'none'
                }}
            />
        </div>
    );
}