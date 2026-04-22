// frontend/src/pages/notes/components/NoteSummary/NoteSummary.jsx
import React, { useEffect, useState } from 'react';
import NoteStatus from '../../../../components/notes/NoteStatus/NoteStatus';
import { getStatusLegend } from '../../../../components/notes/NoteStatus/noteStatusHelpers';
import styles from './NoteSummary.module.css';

export default function NoteSummary({
    dateFilter,
    onDateFilterChange,
    sortType,
    onSortTypeChange,
    sortDirection,
    onSortDirectionChange,
    dateFilterOptions,
    isLoadingFilters,
    statistics,
    groupedNotes,
    selectedStatuses = [],
    onStatusFilterChange,
    currentSearchTerm,
    onSearchFromHistory
}) {
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('note_search_history');
            if (saved) {
                setSearchHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    useEffect(() => {
        try {
            if (searchHistory.length > 0) {
                localStorage.setItem('note_search_history', JSON.stringify(searchHistory));
            }
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, [searchHistory]);

    useEffect(() => {
        if (currentSearchTerm && currentSearchTerm.trim()) {
            const trimmed = currentSearchTerm.trim();
            setSearchHistory(prev => {
                const filtered = prev.filter(term => term !== trimmed);
                return [trimmed, ...filtered].slice(0, 10);
            });
        }
    }, [currentSearchTerm]);

    // Update statistics
    useEffect(() => {}, [statistics]);

    // Handle checkbox changes
    const handleStatusCheckboxChange = (status) => {
        const newSelected = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        onStatusFilterChange(newSelected);
    };

    // Clear all filters
    const handleClearFilters = () => {
        onStatusFilterChange([]);
    };

    // Search history functions
    const handleHistoryClick = (term) => {
        if (onSearchFromHistory) {
            onSearchFromHistory(term);
        }
    };

    const removeFromHistory = (termToRemove, e) => {
        e.stopPropagation();
        setSearchHistory(prev => prev.filter(term => term !== termToRemove));
    };

    const clearAllHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('note_search_history');
    };

    // Helper function to get status legend display with checkboxes
    const getStatusLegendDisplay = () => {
        const sortedStatuses = getStatusLegend(groupedNotes, sortDirection);

        // Get the latest status for each ticket
        const latestStatuses = new Set();
        if (groupedNotes) {
            Object.values(groupedNotes).forEach(ticketNotes => {
                if (ticketNotes && ticketNotes.length > 0) {
                    const latestNote = ticketNotes[0];
                    latestStatuses.add(latestNote.status);
                }
            });
        }

        const statusesWithLatestNotes = sortedStatuses.filter(status =>
            latestStatuses.has(status)
        );

        return statusesWithLatestNotes.map((status, index) => (
            <React.Fragment key={status}>
                <span className={styles.statusLegendItem}>
                    <input
                        type="checkbox"
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusCheckboxChange(status)}
                        className={styles.statusCheckbox}
                    />
                    <label htmlFor={`status-${status}`} className={styles.statusLabel}>
                        <NoteStatus status={status} showBadge={false} />
                    </label>
                </span>
                {index < statusesWithLatestNotes.length - 1 && (
                    <span className={styles.arrow}>
                        {sortDirection === 'desc' ? '→' : '←'}
                    </span>
                )}
            </React.Fragment>
        ));
    };

    // Get sort hint text
    const getSortHintText = () => {
        switch (sortType) {
            case 'notes':
                return sortDirection === 'desc' ? 'Most → Least' : 'Least → Most';
            case 'recent':
                return sortDirection === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest';
            case 'ticket':
                return sortDirection === 'desc' ? 'A → Z' : 'Z → A';
            default:
                return '';
        }
    };

    // Get direction icon title
    const getDirectionTitle = () => {
        return sortDirection === 'desc'
            ? 'Descending (Epic → Resolved)'
            : 'Ascending (Resolved → Epic)';
    };

    // Get the current display value for the select
    const getSelectValue = () => {
        return dateFilter || '90';
    };

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.controlBar}>
                {/* Date filter section */}
                <div className={styles.dateFilterContainer}>
                    <div className={styles.dateFilterGroup}>
                        <span className={styles.dateFilterLabel}>Date Range:</span>
                        <select
                            value={getSelectValue()}
                            onChange={(e) => onDateFilterChange(e.target.value)}
                            className={styles.dateFilterSelect}
                            title="Filter tickets by date range"
                            disabled={isLoadingFilters}
                        >
                            {isLoadingFilters ? (
                                <option value="90">Loading date filters...</option>
                            ) : (
                                dateFilterOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Sort section */}
                <div className={styles.sortContainer}>
                    <div className={styles.sortGroup}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <select
                            value={sortType}
                            onChange={(e) => onSortTypeChange(e.target.value)}
                            className={styles.sortSelect}
                        >
                            <option value="recent">Recently Updated ⏰</option>
                            <option value="status">Status 🎯</option>
                            <option value="ticket">Ticket Number 🔢</option>
                            <option value="notes">Notes Count 📊</option>
                        </select>

                        <button
                            onClick={onSortDirectionChange}
                            className={`${styles.sortDirectionBtn} ${selectedStatuses.length > 0 ? styles.filterActive : ''}`}
                            title={getDirectionTitle()}
                        >
                            {sortDirection === 'desc' ? '↓' : '↑'}
                            {selectedStatuses.length > 0 && (
                                <span className={styles.filterBadge}>{selectedStatuses.length}</span>
                            )}
                        </button>

                        {selectedStatuses.length > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className={styles.sortClearBtn}
                                title="Clear all status filters"
                            >
                                ✕
                            </button>
                        )}

                        <div className={styles.sortInfoInline}>
                            {sortType === 'status' && getStatusLegendDisplay().length > 0 ? (
                                <div className={styles.statusLegend}>
                                    {getStatusLegendDisplay()}
                                </div>
                            ) : (
                                <span className={styles.sortHint}>
                                    {getSortHintText()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics section */}
                <div className={styles.statsBar}>
                    <div className={styles.statItem} title="Number of unique tickets">
                        <span className={styles.statIcon}>🎫</span>
                        <span className={styles.statValue}>{statistics?.ticketCount || 0}</span>
                        <span className={styles.statLabel}>Tickets</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem} title="Total number of notes">
                        <span className={styles.statIcon}>📝</span>
                        <span className={styles.statValue}>{statistics?.totalNotes || 0}</span>
                        <span className={styles.statLabel}>Total Notes</span>
                    </div>
                </div>
            </div>

            {/* === Search History === */}
            {searchHistory.length > 0 && (
                <div className={styles.searchHistoryRow}>
                    <span className={styles.searchHistoryLabel}>🔍 Recent Searches:</span>
                    <div className={styles.searchHistoryItems}>
                        {searchHistory.map((term) => (
                            <div key={term} className={styles.searchHistoryItem}>
                                <button
                                    onClick={() => handleHistoryClick(term)}
                                    className={styles.searchHistoryTerm}
                                    title={`Search: ${term}`}
                                >
                                    {term}
                                </button>
                                <button
                                    onClick={(e) => removeFromHistory(term, e)}
                                    className={styles.searchHistoryRemove}
                                    title="Remove from history"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <span className={styles.searchHistoryCount}>{searchHistory.length}/10</span>
                        <button
                            onClick={clearAllHistory}
                            className={styles.searchHistoryClearAll}
                            title="Clear all search history"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}