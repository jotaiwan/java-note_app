// frontend/src/hooks/useNotes.js
import { useState, useEffect, useCallback } from 'react';
import noteService from '../service/noteService';

export function useNotes(initialDateFilter = '90') {
    const [groupedNotes, setGroupedNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentFilter, setCurrentFilter] = useState(initialDateFilter);

    const fetchNotes = useCallback(async (filter = currentFilter) => {
        setLoading(true);
        setError(null);

        try {
            const apiFilter = filter === 'all' ? null : filter;
            const response = await noteService.getAllNotes(apiFilter);

            if (response && response.success && Array.isArray(response.data)) {
                const groups = response.data.reduce((acc, note) => {
                    const ticket = note.ticket || 'Uncategorized';
                    if (!acc[ticket]) acc[ticket] = [];
                    acc[ticket].push(note);
                    return acc;
                }, {});

                Object.keys(groups).forEach(ticket => {
                    groups[ticket].sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                });

                setGroupedNotes(groups);
                setCurrentFilter(filter);
            } else {
                console.error('Invalid response format:', response);
                setError('Invalid response format');
            }
        } catch (err) {
            console.error('Error loading notes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updateFilter = useCallback((newFilter) => {
        setCurrentFilter(newFilter);
        fetchNotes(newFilter);
    }, [fetchNotes]);

    useEffect(() => {
        fetchNotes(currentFilter);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        groupedNotes,
        loading,
        error,
        refetch: fetchNotes,
        updateFilter,
        currentFilter
    };
}
