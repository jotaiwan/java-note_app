// frontend/src/pages/notes/components/NoteList/NoteList.jsx
// NoteList Component
// Displays a list of notes grouped by ticket
// Handles loading states, errors, and empty states

import React, { useMemo, useState, useRef } from 'react';
import TicketGroup from '../../../../components/notes/TicketGroup/TicketGroup';
import styles from './NoteList.module.css';

// Helper function to get the latest timestamp from a note
const getNoteTimestamp = (note) => {
    return new Date(note.updated_at || note.updatedAt || note.created_at || note.createdAt);
};

export default function NoteList({
    groupedNotes,
    sortedTickets,
    isLoading,
    error,
    onRetry,
    onUpdateNote,
    onAddNote,
    selectedStatuses = [],
    originalUnfilteredNotes,
    searchTerm = '',
    isSearchMode = false,
}) {
    const [expandedNoteId, setExpandedNoteId] = useState(null);

    // Use originalUnfilteredNotes for status determination, fall back to groupedNotes
    const notesForStatus = originalUnfilteredNotes || groupedNotes;

    // Determine each ticket's LATEST status using unfiltered notes
    const ticketLatestStatus = useMemo(() => {
        if (!notesForStatus) return new Map();

        const statusMap = new Map();

        Object.entries(notesForStatus).forEach(([ticket, notes]) => {
            if (!notes || notes.length === 0) return;

            const sortedNotes = [...notes].sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt);
                const dateB = new Date(b.created_at || b.createdAt);
                return dateB - dateA;
            });

            const latestNote = sortedNotes[0];
            statusMap.set(ticket, latestNote?.status);
        });

        return statusMap;
    }, [notesForStatus]);

    // Filter TICKETS based on their LATEST status
    const filteredTickets = useMemo(() => {
        if (!groupedNotes) return [];

        const allTicketKeys = Object.keys(groupedNotes);

        if (selectedStatuses.length === 0) {
            return sortedTickets || allTicketKeys;
        }

        return allTicketKeys.filter(ticket => {
            const latestStatus = ticketLatestStatus.get(ticket);
            return latestStatus && selectedStatuses.includes(latestStatus);
        });
    }, [groupedNotes, selectedStatuses, sortedTickets, ticketLatestStatus]);

    // Sort tickets by LATEST update timestamp (using updated_at across ALL notes)
    const sortedAndFilteredTickets = useMemo(() => {
        if (!filteredTickets.length) return [];

        // Create a copy to avoid mutating
        const tickets = [...filteredTickets];

        // Sort by the most recent updated_at timestamp across all notes
        tickets.sort((ticketA, ticketB) => {
            const getLatestUpdateTimestamp = (ticket) => {
                const notes = groupedNotes[ticket];
                if (!notes || notes.length === 0) {
                    return new Date(0); // Treat as oldest possible
                }

                // Find the latest updated_at timestamp across all notes
                let latestTime = null;
                for (const note of notes) {
                    const noteTime = getNoteTimestamp(note);
                    if (!latestTime || noteTime > latestTime) {
                        latestTime = noteTime;
                    }
                }

                return latestTime || new Date(0);
            };

            const timestampA = getLatestUpdateTimestamp(ticketA);
            const timestampB = getLatestUpdateTimestamp(ticketB);

            // Sort in descending order (most recent first)
            return timestampB - timestampA;
        });

        return tickets;
    }, [filteredTickets, groupedNotes]);

    const handleUpdateNote = async (noteId, updateData) => {
        try {
            // Set this note to be expanded
            setExpandedNoteId(noteId);

            // Call the original onUpdateNote
            const result = await onUpdateNote(noteId, updateData);

            // Clear after 3 seconds (so user can see which one was updated)
            setTimeout(() => {
                setExpandedNoteId(null);
            }, 3000);

            return result;
        } catch (error) {
            // Clear on error too
            setExpandedNoteId(null);
            throw error;
        }
    };

    const getTicketForExpandedNote = () => {
        if (!expandedNoteId || !groupedNotes) return null;

        for (const [ticket, notes] of Object.entries(groupedNotes)) {
            if (notes && notes.some(note => note.id === expandedNoteId)) {
                return ticket;
            }
        }
        return null;
    };

    const expandedTicket = getTicketForExpandedNote();

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Loading notes...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={onRetry} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    // Empty state
    if (!groupedNotes || Object.keys(groupedNotes).length === 0) {
        return (
            <div className={styles.empty}>
                <p>📭 No notes found</p>
                <p className={styles.emptyHint}>
                    Create a new note or adjust your search criteria
                </p>
            </div>
        );
    }

    // No tickets match the selected filters
    if (selectedStatuses.length > 0 && filteredTickets.length === 0) {
        return (
            <div className={styles.empty}>
                <p>📭 No tickets match the selected status filters</p>
                <p className={styles.emptyHint}>
                    Selected statuses: {selectedStatuses.join(', ')}
                </p>
            </div>
        );
    }

    // Render tickets - show ALL notes from groupedNotes for each ticket that passes the filter
    return (
        <div className={styles.listContainer}>
            <div className={styles.groups}>
                {sortedAndFilteredTickets.map((ticket, index) => {
                    // Get ALL notes for this ticket from groupedNotes
                    const allNotesForTicket = groupedNotes[ticket];

                    // Get total count from unfiltered notes for accurate count display
                    const totalNoteCount = originalUnfilteredNotes?.[ticket]?.length || allNotesForTicket?.length || 0;

                    return (
                        <div key={ticket}>
                            <TicketGroup
                                ticket={ticket}
                                notes={allNotesForTicket}
                                totalNoteCount={totalNoteCount}
                                onUpdateNote={handleUpdateNote}
                                onAddNote={onAddNote}
                                isTicketExpanded={ticket === expandedTicket}
                                expandedNoteId={expandedNoteId}
                                searchTerm={searchTerm}
                                isSearchMode={isSearchMode}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}