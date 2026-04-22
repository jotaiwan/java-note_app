// src/pages/notes/components/AddNoteModal/components/StatusButtons.jsx
import React, { useEffect } from 'react';
import styles from './StatusButtons.module.css';

const STATUS_OPTIONS = [
    { value: 'Epic', label: 'Epic', color: '#9c2be7' },
    { value: 'Open', label: 'Open', color: '#28a745' },
    { value: 'Processing', label: 'Processing', color: '#17a2b8' },
    { value: 'Follow', label: 'Follow', color: '#ffc107' },
    { value: 'Resolved', label: 'Resolved', color: '#6c757d' },
    { value: 'Meeting', label: 'Meeting', color: '#fd7e14' },
    { value: 'NoteOnly', label: 'Note Only', color: '#6f42c1' }
];

export default function StatusButtons({ selectedStatus, onStatusChange, ticketNumber = '' }) {
    // Determine ticket type
    const isNoteTicket = ticketNumber.startsWith('NOTE_');
    const isMeetingTicket = ticketNumber.startsWith('MEETING');

    // Auto-set status based on ticket type
    useEffect(() => {
        if (isNoteTicket) {
            onStatusChange('NoteOnly');
        } else if (isMeetingTicket) {
            onStatusChange('Meeting');
        }
    }, [isNoteTicket, isMeetingTicket, onStatusChange]);

    // Filter status options based on ticket type
    const getFilteredOptions = () => {
        // NOTE_* tickets: only show NoteOnly
        if (isNoteTicket) {
            return STATUS_OPTIONS.filter(opt => opt.value === 'NoteOnly');
        }

        // MEETING tickets: only show Meeting
        if (isMeetingTicket) {
            return STATUS_OPTIONS.filter(opt => opt.value === 'Meeting');
        }

        // Regular tickets: show all except NoteOnly and Meeting
        return STATUS_OPTIONS.filter(opt =>
            opt.value !== 'NoteOnly' && opt.value !== 'Meeting'
        );
    };

    const filteredOptions = getFilteredOptions();

    // If no options (shouldn't happen), don't render
    if (filteredOptions.length === 0) {
        return null;
    }

    return (
        <div className={styles.statusContainer}>
            <label className={styles.statusLabel}>Status</label>
            <div className={styles.statusButtons}>
                {filteredOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`${styles.statusButton} ${selectedStatus === option.value ? styles.selected : ''
                            }`}
                        style={{
                            '--status-color': option.color,
                            backgroundColor: selectedStatus === option.value ? option.color : 'transparent',
                            color: selectedStatus === option.value ? 'white' : '#333',
                            borderColor: option.color,
                            cursor: (isNoteTicket || isMeetingTicket) ? 'default' : 'pointer'
                        }}
                        onClick={() => {
                            // Allow click only if not auto-set by ticket type
                            if (!isNoteTicket && !isMeetingTicket) {
                                onStatusChange(option.value);
                            }
                        }}
                        disabled={isNoteTicket || isMeetingTicket}
                        title={
                            isNoteTicket ? 'Status auto-set to Note Only for NOTE_* tickets' :
                                isMeetingTicket ? 'Status auto-set to Meeting for MEETING tickets' :
                                    `Set status to ${option.label}`
                        }
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Show info message for special ticket types */}
            {(isNoteTicket || isMeetingTicket) && (
                <div className={styles.statusInfo}>
                    ℹ️ Status is locked to {isNoteTicket ? 'Note Only' : 'Meeting'} for this ticket type
                </div>
            )}
        </div>
    );
}