// frontend/src/components/notes/NoteStatus/NoteStatus.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { getStatusColor, getStatusBgColor } from './noteStatusHelpers';
import styles from './NoteStatus.module.css';

const NoteStatus = ({
    status,
    showIcon = true,
    showText = true,
    size = 'medium',
    className = '',
    showBadge = true
}) => {
    // Direct icon object mapping
    const iconMap = {
        'Epic': Icons.faFlag,
        'Open': Icons.faCircle,
        'Processing': Icons.faSpinner,
        'Meeting': Icons.faUsers,
        'Follow': Icons.faEye,
        'NoteOnly': Icons.faStickyNote,
        'Resolved': Icons.faCheckCircle
    };

    const icon = iconMap[status];

    // Get colors
    const color = getStatusColor(status);
    const bgColor = getStatusBgColor(status);

    // Render icon
    const renderIcon = () => {
        if (!showIcon || !icon) return null;

        const shouldSpin = (status === 'Processing');

        return (
            <FontAwesomeIcon
                icon={icon}
                spin={shouldSpin}
                className={styles.icon}
                style={{ color: color }}
            />
        );
    };

    if (!showBadge) {
        return (
            <span className={`${styles.statusInline} ${className}`}>
                {renderIcon()}
                {showText && <span className={styles.text} style={{ color: color }}>{status}</span>}
            </span>
        );
    }

    return (
        <div
            className={`${styles.statusBadge} ${className}`}
            style={{
                backgroundColor: bgColor,
                color: color,
                borderColor: color
            }}
        >
            {renderIcon()}
            {showText && <span className={styles.text}>{status}</span>}
        </div>
    );
};

export default NoteStatus;