// frontend/src/components/notes/NoteStatus/noteStatusHelpers.js

// Get all unique statuses from data (only valid ones)
export const getAllStatusesFromData = (groupedNotes) => {
    const statuses = new Set();
    const VALID_STATUSES = ['Epic', 'Open', 'Processing', 'Meeting', 'Follow', 'NoteOnly', 'Resolved'];

    Object.values(groupedNotes || {}).forEach(ticketNotes => {
        ticketNotes.forEach(note => {
            if (note.status && VALID_STATUSES.includes(note.status)) {
                statuses.add(note.status); // Keep original case
            }
        });
    });
    return Array.from(statuses);
};

// Priority for the 7 statuses only
export const getPriority = (status) => {
    const priorityMap = {
        'Epic': 1,      // Highest priority
        'Open': 2,
        'Processing': 3,
        'Meeting': 4,
        'Follow': 5,
        'NoteOnly': 6,
        'Resolved': 7   // Lowest priority
    };

    return priorityMap[status] || 1000;
};

// Sort tickets by status
export const sortTicketsByStatus = (tickets, groupedNotes, direction = 'desc') => {
    const priorityMap = {
        'Epic': 1,
        'Open': 2,
        'Processing': 3,
        'Meeting': 4,
        'Follow': 5,
        'NoteOnly': 6,
        'Resolved': 7
    };

    return tickets.sort((ticketA, ticketB) => {
        const notesA = groupedNotes[ticketA];
        const notesB = groupedNotes[ticketB];

        if (!notesA || !notesB || notesA.length === 0 || notesB.length === 0) {
            return 0;
        }

        const latestNoteA = notesA[0];
        const latestNoteB = notesB[0];

        const statusA = latestNoteA.status || 'Unknown';
        const statusB = latestNoteB.status || 'Unknown';

        const priorityA = priorityMap[statusA] || 1000;
        const priorityB = priorityMap[statusB] || 1000;

        const result = priorityA - priorityB;
        return direction === 'desc' ? result : -result;
    });
};

// Get status legend
export const getStatusLegend = (groupedNotes, sortDirection = 'desc') => {
    const statuses = getAllStatusesFromData(groupedNotes);

    // Sort statuses by priority
    const sortedStatuses = statuses.sort((a, b) => {
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        return sortDirection === 'desc' ? priorityA - priorityB : priorityB - priorityA;
    });

    return sortedStatuses;
};

// Get status color (for NoteStatus component)
export const getStatusColor = (status) => {
    const colorMap = {
        'Epic': '#8b5cf6',
        'Open': '#10b981',
        'Processing': '#f59e0b',
        'Meeting': '#8b5cf6',
        'Follow': '#6366f1',
        'NoteOnly': '#8b5cf6',
        'Resolved': '#10b981'
    };

    return colorMap[status] || '#6b7280';
};

// Get status background color
export const getStatusBgColor = (status) => {
    const bgColorMap = {
        'Epic': '#ede9fe',
        'Open': '#d1fae5',
        'Processing': '#fef3c7',
        'Meeting': '#ede9fe',
        'Follow': '#e0e7ff',
        'NoteOnly': '#ede9fe',
        'Resolved': '#d1fae5'
    };

    return bgColorMap[status] || '#f3f4f6';
};