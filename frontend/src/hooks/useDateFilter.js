// frontend/src/hooks/useDateFilter.js
import { useState, useEffect } from 'react';

// Module-level promise to dedupe date-filters fetch across mounts
let dateFiltersPromise = null;

export function useDateFilter() {
    const [dateFilter, setDateFilter] = useState('90');
    const [dateFilterOptions, setDateFilterOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDateFilters = async () => {
            setLoading(true);
            try {
                if (!dateFiltersPromise) {
                    dateFiltersPromise = fetch('/api/notes/date-filters')
                        .then(res => res.json())
                        .catch(err => {
                            // clear promise on error so next attempt can retry
                            dateFiltersPromise = null;
                            throw err;
                        });
                }

                const data = await dateFiltersPromise;

                if (data && data.success) {
                    setDateFilterOptions(data.data);
                } else {
                    setDateFilterOptions(getDefaultDateFilters());
                }
            } catch (error) {
                console.error('Failed to load date filters:', error);
                setDateFilterOptions(getDefaultDateFilters());
            } finally {
                setLoading(false);
            }
        };

        loadDateFilters();
    }, []);

    const getDefaultDateFilters = () => {
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = currentYear; year >= 2020; year--) {
            years.push(year.toString());
        }

        return [
            { value: '90', label: 'Last 90 Days' },
            { value: '180', label: 'Last 180 Days' },
            { value: '360', label: 'Last 360 Days' },
            ...years.map(year => ({ value: year, label: `Year ${year}` })),
            { value: 'all', label: 'All Notes' }
        ];
    };

    // Helper to check if current filter is 'all'
    const isAllFilter = dateFilter === 'all';

    return {
        dateFilter,
        setDateFilter,
        dateFilterOptions,
        loading,
        isAllFilter
    };
}