// frontend/src/components/notes/TicketGroup/TicketGroup.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import NoteRow from '../NoteRow';
import NoteStatus from '../NoteStatus';
import styles from './TicketGroup.module.css';
import { formatDate, getRelativeTime, formatDateWithTimezonesCombined } from '../utils/dateHelper';

// Jira configuration
const JIRA_DOMAIN = 'https://viatorinc.atlassian.net/browse/';

// Helper function to truncate subject
const truncateSubject = (subject, maxLength = 150) => {
    if (!subject) return '';
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength).trim() + '...';
};

// Helper function to get time ago string
const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// Helper function to get the latest timestamp from a note (updated_at or created_at)
const getNoteTimestamp = (note) => {
    return new Date(note.updated_at || note.updatedAt || note.created_at || note.createdAt);
};

export default function TicketGroup({
    ticket,
    notes,
    onUpdateNote,
    onAddNote,
    onUpdateStatus,
    totalNoteCount,
    isTicketExpanded = false,
    expandedNoteId = null,
    searchTerm = '',
    isSearchMode = false
}) {
    const [isExpanded, setIsExpanded] = useState(isTicketExpanded || isSearchMode);

    useEffect(() => {
        if (isTicketExpanded || isSearchMode) {
            setIsExpanded(true);
        }
    }, [isTicketExpanded, isSearchMode]);

    const [visibleCount, setVisibleCount] = useState(20);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const ticketRef = useRef(null);
    const statusButtonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Memoize sorted notes by created_at (for display order - newest first)
    const sortedNotes = useMemo(() => {
        if (!notes || !Array.isArray(notes) || notes.length === 0) {
            return [];
        }
        const sorted = [...notes].sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt);
            const dateB = new Date(b.created_at || b.createdAt);
            return dateB - dateA;
        });
        return sorted;
    }, [notes]);

    // Get the LATEST update timestamp across ALL notes (using updated_at)
    const latestUpdateTimestamp = useMemo(() => {
        if (!notes || notes.length === 0) return null;

        let latestTime = null;

        for (const note of notes) {
            // Use updated_at if available, otherwise use created_at
            const noteTime = getNoteTimestamp(note);

            if (!latestTime || noteTime > latestTime) {
                latestTime = noteTime;
            }
        }

        return latestTime;
    }, [notes]);

    // Check if ticket was recently updated (within last 24 hours)
    const isRecentlyUpdated = useMemo(() => {
        if (!latestUpdateTimestamp) return false;
        const now = new Date();
        const diffInHours = (now - latestUpdateTimestamp) / (1000 * 60 * 60);
        return diffInHours < 24;
    }, [latestUpdateTimestamp]);

    // Get latest update time string
    const latestUpdateTimeAgo = useMemo(() => {
        if (!latestUpdateTimestamp) return '';
        return getTimeAgo(latestUpdateTimestamp);
    }, [latestUpdateTimestamp]);

    // Calculate visible notes based on expand state
    const visibleNotes = useMemo(() => {
        if (isExpanded) {
            return sortedNotes;
        }
        return sortedNotes.slice(0, visibleCount);
    }, [sortedNotes, isExpanded, visibleCount]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                statusButtonRef.current &&
                !statusButtonRef.current.contains(event.target)
            ) {
                setShowStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle scroll to show/hide Go To Top button
    useEffect(() => {
        const handleScroll = () => {
            if (ticketRef.current) {
                const rect = ticketRef.current.getBoundingClientRect();
                setShowGoToTop(rect.top < -200);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle copy ticket ID to clipboard
    const handleCopyTicket = (e) => {
        e.preventDefault();
        e.stopPropagation();

        navigator.clipboard.writeText(ticket).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            const textarea = document.createElement('textarea');
            textarea.value = ticket;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Handle open Jira from ticket badge
    const handleOpenJira = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const jiraUrl = `${JIRA_DOMAIN}${ticket}`;
        window.open(jiraUrl, '_blank', 'noopener,noreferrer');
    };

    // Handle add note button click
    const handleAddNoteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddNote) {
            onAddNote(ticket);
        }
    };

    // Toggle status dropdown
    const toggleStatusDropdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowStatusDropdown(!showStatusDropdown);
    };

    // Handle status selection from dropdown
    const handleStatusSelect = async (selectedStatus) => {
        if (isUpdatingStatus) return;

        const latestNote = sortedNotes[0];
        if (!latestNote) return;

        if (latestNote.status?.toLowerCase() === selectedStatus.toLowerCase()) {
            setShowStatusDropdown(false);
            return;
        }

        try {
            setIsUpdatingStatus(true);

            if (onUpdateStatus) {
                await onUpdateStatus(latestNote.id, { status: selectedStatus }, ticket);
            }
            else if (onUpdateNote) {
                await onUpdateNote(latestNote.id, { ...latestNote, status: selectedStatus });
            }

            setShowStatusDropdown(false);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Handle Go To Top click
    const handleGoToTop = () => {
        if (ticketRef.current) {
            ticketRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Handle Collapse All
    const handleCollapse = () => {
        setVisibleCount(20);
        setIsExpanded(false);
    };

    // Early return after Hooks
    if (sortedNotes.length === 0) {
        return null;
    }

    // Get latest status and subject (using created_at order)
    const latestNote = sortedNotes[0];
    const latestStatus = latestNote.status;
    const latestSubject = latestNote.subject;

    // Handle expand/collapse
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Handle "Show More"
    const handleShowMore = () => {
        setVisibleCount(prev => Math.min(prev + 20, sortedNotes.length));
        if (visibleCount + 20 >= sortedNotes.length) {
            setIsExpanded(true);
        }
    };

    // Use totalNoteCount if provided, otherwise fall back to sortedNotes.length
    const displayNoteCount = totalNoteCount !== undefined ? totalNoteCount : sortedNotes.length;

    return (
        <div ref={ticketRef} className={`${styles.ticketGroup} ${isRecentlyUpdated ? styles.recentlyUpdated : ''}`}>
            {/* Ticket Header with Collapse/Expand */}
            <div
                className={styles.ticketHeader}
                onClick={(e) => {
                    const isInteractive =
                        e.target.tagName === 'BUTTON' ||
                        e.target.tagName === 'A' ||
                        e.target.closest('button') ||
                        e.target.closest('a') ||
                        e.target.closest(`.${styles.actionButton}`) ||
                        e.target.closest(`.${styles.ticketActions}`) ||
                        e.target.closest(`.${styles.ticketBadge}`) ||
                        e.target.closest(`.${styles.noteStatusBadge}`) ||
                        e.target.closest(`.${styles.statusDropdownContainer}`) ||
                        e.target.closest(`.${styles.statusDropdown}`);

                    if (!isInteractive) {
                        handleToggleExpand();
                    }
                }}
            >
                <div className={styles.ticketInfo}>
                    {/* Ticket badge */}
                    <a
                        href={`${JIRA_DOMAIN}${ticket}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.ticketBadge}
                        onClick={(e) => e.stopPropagation()}
                        title="Open in Jira"
                    >
                        {ticket}
                    </a>

                    {/* Action buttons */}
                    <div className={styles.ticketActions}>
                        <button
                            className={`${styles.actionButton} ${styles.copyButton} ${copied ? styles.copied : ''}`}
                            onClick={handleCopyTicket}
                            title={copied ? 'Copied!' : 'Copy ticket ID'}
                        >
                            {copied ? '✓' : '📋'}
                        </button>

                        <button
                            className={`${styles.actionButton} ${styles.addButton}`}
                            onClick={handleAddNoteClick}
                            title="Add note to this ticket"
                        >
                            ➕
                        </button>
                    </div>

                    <span className={styles.ticketStats}>
                        <span className={styles.statsItem}>
                            <span className={styles.statsIcon}>📊</span>
                            <span className={styles.statsNumber}>{displayNoteCount}</span>
                        </span>
                    </span>

                    {/* Last update badge - using updated_at */}
                    {latestUpdateTimeAgo && (
                        <span className={styles.lastUpdateBadge} title={`Last updated: ${latestUpdateTimestamp?.toLocaleString()}`}>
                            🕒 {latestUpdateTimeAgo}
                        </span>
                    )}

                    <span className={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                    </span>

                    {latestSubject && (
                        <span className={styles.ticketSubject} title={latestSubject}>
                            {truncateSubject(latestSubject, 100)}
                        </span>
                    )}
                </div>

                <div className={styles.ticketStats}>
                    <div className={styles.statusDropdownContainer}>
                        <div
                            ref={statusButtonRef}
                            onClick={toggleStatusDropdown}
                            className={`${styles.statusButton} ${isUpdatingStatus ? styles.updating : ''}`}
                            style={{ cursor: isUpdatingStatus ? 'wait' : 'pointer' }}
                            title={isUpdatingStatus ? 'Updating status...' : 'Click to change status'}
                        >
                            <NoteStatus
                                status={latestStatus}
                                size="medium"
                                showIcon={true}
                                showText={true}
                                className={`${styles.noteStatusBadge} ${styles.clickableStatus}`}
                            />
                            <span className={styles.dropdownArrow}>▼</span>
                        </div>

                        {showStatusDropdown && (
                            <div ref={dropdownRef} className={styles.statusDropdown}>
                                <div className={styles.statusDropdownHeader}>
                                    <span>Change Status</span>
                                    <button
                                        className={styles.closeDropdown}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowStatusDropdown(false);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className={styles.statusDropdownContent}>
                                    <div className={styles.statusRow}>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Open' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Open')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#28a745' }}
                                        >
                                            Open
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Processing' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Processing')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#17a2b8' }}
                                        >
                                            Processing
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Follow' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Follow')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#ffc107' }}
                                        >
                                            Follow
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Resolved' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Resolved')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#6c757d' }}
                                        >
                                            Resolved
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Meeting' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Meeting')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#fd7e14' }}
                                        >
                                            Meeting
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'NoteOnly' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('NoteOnly')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#6f42c1' }}
                                        >
                                            Note Only
                                        </button>
                                        <button
                                            className={`${styles.rowStatusButton} ${latestStatus === 'Epic' ? styles.active : ''}`}
                                            onClick={() => handleStatusSelect('Epic')}
                                            disabled={isUpdatingStatus}
                                            style={{ '--status-color': '#9c2be7' }}
                                        >
                                            Epic
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conditional Note List */}
            {isExpanded ? (
                <div className={styles.notesList}>
                    <div className={styles.timeline}></div>
                    {visibleNotes.map((note, index) => (
                        <NoteRow
                            key={note.id}
                            note={note}
                            isLatest={index === 0}
                            showTimeline={sortedNotes.length > 1}
                            onUpdateNote={onUpdateNote}
                            isNoteExpanded={note.id === expandedNoteId}
                            searchTerm={searchTerm}
                        />
                    ))}
                    {visibleCount < sortedNotes.length && (
                        <div className={styles.showMoreContainer}>
                            <button
                                onClick={handleShowMore}
                                className={styles.showMoreButton}
                            >
                                Show More ({sortedNotes.length - visibleCount} more notes)
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.collapsedPreview}>
                    <div className={styles.previewContent}>
                        <span className={styles.previewIcon}>📝</span>
                        <span className={styles.previewText}>
                            Contains {displayNoteCount} notes, click to expand
                        </span>
                        {sortedNotes.length > 0 && (
                            <div className={styles.latestPreview}>
                                <strong>Latest </strong>
                                <span className={`${styles.infoBadge} ${styles.dateBadge}`}>
                                    {formatDateWithTimezonesCombined(
                                        sortedNotes[0].created_at || sortedNotes[0].createdAt || sortedNotes[0].timestamp,
                                        {
                                            weekdayFormat: 'short',
                                            format: {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }
                                        }
                                    )}
                                </span> :
                                <span className={styles.spacer}>
                                    {sortedNotes[0].note?.substring(0, 100)}
                                    {sortedNotes[0].note?.length > 100 ? '...' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.ticketFooter}>
                <div className={styles.lastUpdated}>
                    Last Updated: {latestUpdateTimestamp?.toLocaleString() || 'N/A'}
                </div>
                <div className={styles.footerControls}>
                    {showGoToTop && isExpanded && (
                        <button
                            onClick={handleGoToTop}
                            className={styles.goToTopButton}
                            title="Scroll back to top of this ticket"
                        >
                            ↑ Go To Top
                        </button>
                    )}
                    {isExpanded && sortedNotes.length > 20 && (
                        <button
                            onClick={handleCollapse}
                            className={styles.collapseButton}
                            title="Collapse this ticket"
                        >
                            Collapse
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}