// frontend/src/pages/notes/Index.jsx
import React, { useState, useMemo } from 'react';
import { NoteHeader, NoteList, NoteSummary, AddNoteModal } from './components';
import SqlPreviewModal from './sqlPreviewModal/SqlPreviewModal';
import { useNotes } from '../../hooks/useNotes';
import { useDateFilter } from '../../hooks/useDateFilter';
import { sortTicketsByStatus } from '../../components/notes/NoteStatus/noteStatusHelpers';
import noteService from '../../service/noteService';
import styles from './Index.module.css';

export default function NotesPage() {
    const [sortType, setSortType] = useState('recent');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filteredNotes, setFilteredNotes] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTicketNumber, setModalTicketNumber] = useState('');
    const [isSqlPreviewOpen, setIsSqlPreviewOpen] = useState(false);
    const [sqlPreviewData, setSqlPreviewData] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');
    const [historyTerm, setHistoryTerm] = useState('');

    const {
        dateFilter,
        setDateFilter,
        dateFilterOptions,
        loading: isLoadingFilters
    } = useDateFilter();

    const {
        groupedNotes,
        loading: isNoteListLoading,
        error,
        updateFilter: fetchNotesWithFilter
    } = useNotes(dateFilter);

    const handleSearch = async (searchTerm, autoSearch = true) => {
        setCurrentSearchTerm(searchTerm);

        if (!searchTerm.trim()) {
            setFilteredNotes(null);
            setSearchError(null);
            setIsSearching(false);
            setIsSearchMode(false);
            return;
        }

        if (!autoSearch) return;

        setIsSearchMode(true);
        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await noteService.searchNotes(searchTerm);
            if (response.success && response.data) {
                const grouped = {};
                response.data.forEach(note => {
                    if (!grouped[note.ticket]) grouped[note.ticket] = [];
                    grouped[note.ticket].push(note);
                });
                setFilteredNotes(grouped);
                setSearchError(null);
            } else {
                setFilteredNotes({});
                setSearchError('No results found');
            }
        } catch (error) {
            console.error('Search failed:', error);
            setSearchError(error.message || 'Search failed');
            setFilteredNotes({});
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setFilteredNotes(null);
        setSearchError(null);
        setIsSearching(false);
        setIsSearchMode(false);
        setCurrentSearchTerm('');
    };

    const statusFilteredNotes = useMemo(() => {
        const notesToFilter = isSearchMode ? filteredNotes : groupedNotes;
        if (!notesToFilter) return notesToFilter;
        if (selectedStatuses.length === 0) return notesToFilter;

        const ticketLatestStatus = {};
        Object.keys(notesToFilter).forEach(ticket => {
            const ticketNotes = notesToFilter[ticket];
            if (!ticketNotes || ticketNotes.length === 0) return;
            const sorted = [...ticketNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            ticketLatestStatus[ticket] = sorted[0]?.status;
        });

        const filtered = {};
        Object.keys(notesToFilter).forEach(ticket => {
            if (selectedStatuses.includes(ticketLatestStatus[ticket])) {
                filtered[ticket] = notesToFilter[ticket];
            }
        });
        return filtered;
    }, [groupedNotes, filteredNotes, selectedStatuses, isSearchMode]);

    const displayNotes = statusFilteredNotes;

    const sortedTickets = useMemo(() => {
        if (!displayNotes) return [];
        const tickets = Object.keys(displayNotes);

        if (sortType === 'status') {
            return sortTicketsByStatus(tickets, displayNotes, sortDirection);
        }

        return tickets.sort((ticketA, ticketB) => {
            const notesA = displayNotes[ticketA];
            const notesB = displayNotes[ticketB];
            if (!notesA || !notesB || notesA.length === 0 || notesB.length === 0) return 0;

            let compareResult = 0;
            switch (sortType) {
                case 'recent':
                    compareResult = new Date(notesB[0].createdAt) - new Date(notesA[0].createdAt);
                    break;
                case 'ticket':
                    compareResult = ticketA.localeCompare(ticketB, 'en', { numeric: true });
                    break;
                case 'notes':
                    compareResult = notesB.length - notesA.length;
                    break;
                default:
                    compareResult = 0;
            }
            return sortDirection === 'asc' ? -compareResult : compareResult;
        });
    }, [displayNotes, sortType, sortDirection]);

    const originalNotesForStats = isSearchMode ? filteredNotes : groupedNotes;

    const totalNotes = useMemo(() => {
        if (!originalNotesForStats) return 0;
        return Object.values(originalNotesForStats).reduce((total, notes) => total + (notes?.length || 0), 0);
    }, [originalNotesForStats]);

    const ticketCount = useMemo(() => {
        if (!originalNotesForStats) return 0;
        return Object.keys(originalNotesForStats).length;
    }, [originalNotesForStats]);

    const averageNotes = useMemo(() => {
        if (ticketCount === 0) return 0;
        return Math.round(totalNotes / ticketCount * 10) / 10;
    }, [totalNotes, ticketCount]);

    const statistics = { ticketCount, totalNotes, averageNotes };

    const handleUpdateNote = async (noteId, updateData) => {
        try {
            const result = await noteService.updateNote(noteId, updateData);
            await fetchNotesWithFilter(dateFilter);
            if (isSearchMode && currentSearchTerm) {
                await handleSearch(currentSearchTerm);
            }
            return result;
        } catch (error) {
            console.error('Error updating note:', error);
            const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred.';
            alert(`Update failed: ${errorMessage}`);
            throw error;
        }
    };

    const handleDateFilterChange = async (newFilter) => {
        setDateFilter(newFilter);
        setFilteredNotes(null);
        setSelectedStatuses([]);
        setSearchError(null);
        setIsSearchMode(false);
        setIsSearching(false);
        setCurrentSearchTerm('');
        await fetchNotesWithFilter(newFilter);
    };

    const handleSortTypeChange = (newSortType) => setSortType(newSortType);

    const handleSortDirectionChange = () => {
        setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
    };

    const handleOpenSqlPreview = (data) => {
        setSqlPreviewData(data);
        setIsSqlPreviewOpen(true);
    };

    const handleCloseSqlPreview = () => {
        setIsSqlPreviewOpen(false);
        setSqlPreviewData(null);
    };

    const handleMenuClick = (_isOpen) => {};

    const handleAddNote = async (submitData) => {
        try {
            const result = await noteService.createNote(submitData);
            if (result && result.success === false) {
                throw new Error(result.message || 'Failed to create note');
            }
            setIsModalOpen(false);
            setModalTicketNumber('');
            await fetchNotesWithFilter(dateFilter);
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    };

    const handleAddButtonClick = () => {
        setModalTicketNumber('');
        setIsModalOpen(true);
    };

    const handleAddNoteWithTicket = (ticketNumber) => {
        setModalTicketNumber(ticketNumber);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalTicketNumber('');
    };

    const isLoading = isNoteListLoading || isSearching;

    return (
        <div className={styles.page}>
            <NoteHeader
                onSearch={handleSearch}
                onClearSearch={handleClearSearch}
                onAddClick={handleAddButtonClick}
                onOpenSqlPreview={handleOpenSqlPreview}
                onMenuClick={handleMenuClick}
                isSearching={isSearching}
                triggerTerm={historyTerm}
                onTriggerConsumed={() => setHistoryTerm('')}
            />

            <div className={styles.contentArea}>
                <div className={styles.stickySummary}>
                    <NoteSummary
                        dateFilter={dateFilter}
                        onDateFilterChange={handleDateFilterChange}
                        sortType={sortType}
                        onSortTypeChange={handleSortTypeChange}
                        sortDirection={sortDirection}
                        onSortDirectionChange={handleSortDirectionChange}
                        dateFilterOptions={dateFilterOptions}
                        isLoadingFilters={isLoadingFilters}
                        statistics={statistics}
                        groupedNotes={groupedNotes}
                        selectedStatuses={selectedStatuses}
                        onStatusFilterChange={setSelectedStatuses}
                        currentSearchTerm={currentSearchTerm}
                        onSearchFromHistory={(term) => setHistoryTerm(term)}
                    />

                    {isSearching && (
                        <div className={styles.searchStatus}>Searching...</div>
                    )}
                    {searchError && !isSearching && isSearchMode && (
                        <div className={styles.searchError}>{searchError}</div>
                    )}
                    {isSearchMode && !isSearching && !searchError && filteredNotes && (
                        <div className={styles.searchModeIndicator}>
                            <span>Search Results ({totalNotes} notes found)</span>
                            <button onClick={handleClearSearch} className={styles.clearSearchBtn}>
                                ✕ Clear Search
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.scrollableList}>
                    <NoteList
                        groupedNotes={displayNotes}
                        sortedTickets={sortedTickets}
                        isLoading={isLoading}
                        error={isSearchMode ? searchError : error}
                        onRetry={() => fetchNotesWithFilter(dateFilter)}
                        onUpdateNote={handleUpdateNote}
                        onAddNote={handleAddNoteWithTicket}
                        selectedStatuses={selectedStatuses}
                        originalUnfilteredNotes={isSearchMode ? filteredNotes : groupedNotes}
                        searchTerm={isSearchMode ? currentSearchTerm : ''}
                        isSearchMode={isSearchMode}
                    />
                </div>
            </div>

            <AddNoteModal
                key={modalTicketNumber}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onAddNote={handleAddNote}
                ticketNumber={modalTicketNumber}
            />

            <SqlPreviewModal
                isOpen={isSqlPreviewOpen}
                onClose={handleCloseSqlPreview}
                data={sqlPreviewData}
            />
        </div>
    );
}
