// src/components/notes/utils/dateHelper.js

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return options.noDateText || 'No date';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return options.invalidDateText || 'Invalid date';
        }

        // Default formatting options
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const formatOptions = { ...defaultOptions, ...options.format };

        let formattedDate = date.toLocaleString('en-US', formatOptions);

        // Add day of week if requested
        if (options.includeDayOfWeek) {
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: options.weekdayFormat || 'long' });

            if (options.dayOfWeekPosition === 'end') {
                formattedDate = `${formattedDate}, ${dayOfWeek}`;
            } else {
                formattedDate = `${dayOfWeek}, ${formattedDate}`;
            }
        }

        // Convert MM/DD/YYYY to YYYY-MM-DD (or use custom formatter)
        if (options.useISODateFormat !== false && !options.includeDayOfWeek) {
            formattedDate = formattedDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
        }

        return formattedDate;
    } catch (error) {
        console.error('Date formatting error:', error);
        return options.errorText || 'Invalid date';
    }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} dateString 
 * @returns {string}
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return formatDate(dateString);
    } catch (error) {
        console.error('Relative time error:', error);
        return '';
    }
};

/**
 * Check if date is valid
 * @param {string} dateString 
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// ========== NEW HELPER FUNCTIONS ==========

/**
 * Format date for datetime-local input (YYYY-MM-DDThh:mm)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date for input
 */
export const formatForDateTimeInput = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Format: YYYY-MM-DDThh:mm
        return date.toISOString().slice(0, 16);
    } catch (error) {
        console.error('DateTime input formatting error:', error);
        return '';
    }
};

/**
 * Format date for display (MM/DD/YYYY, hh:mm AM/PM)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date for display
 */
export const formatForDisplay = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Display formatting error:', error);
        return dateString;
    }
};

/**
 * Format date for backend (YYYY-MM-DD HH:mm:ss)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date for backend
 */
export const formatForBackend = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('Backend formatting error:', error);
        return dateString;
    }
};

/**
 * Parse datetime-local input value to ISO string
 * @param {string} inputValue - Value from datetime-local input (YYYY-MM-DDThh:mm)
 * @returns {string} ISO date string
 */
export const parseFromDateTimeInput = (inputValue) => {
    if (!inputValue) return '';

    try {
        const date = new Date(inputValue);
        if (isNaN(date.getTime())) return '';

        return date.toISOString();
    } catch (error) {
        console.error('Date parse error:', error);
        return '';
    }
};

// ========== EXISTING TIMEZONE FUNCTIONS ==========

/**
 * Format date with UTC and Sydney time
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {Object} Object with UTC and Sydney formatted strings
 */
export const formatDateWithTimezones = (dateString, options = {}) => {
    if (!dateString) return { utc: 'No date', sydney: 'No date' };

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { utc: 'Invalid date', sydney: 'Invalid date' };
        }

        // Default formatting options
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const formatOptions = { ...defaultOptions, ...options.format };

        // UTC time - get as YYYY-MM-DD format
        const utcDate = date.toLocaleDateString('en-US', {
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Convert UTC from MM/DD/YYYY to YYYY-MM-DD
        const utcParts = utcDate.split('/');
        const utcFormattedDate = `${utcParts[2]}-${utcParts[0]}-${utcParts[1]}`;

        // Get UTC time
        const utcTime = date.toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Sydney time - get as YYYY-MM-DD format
        const sydneyDate = date.toLocaleDateString('en-US', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Convert Sydney from MM/DD/YYYY to YYYY-MM-DD
        const sydneyParts = sydneyDate.split('/');
        const sydneyFormattedDate = `${sydneyParts[2]}-${sydneyParts[0]}-${sydneyParts[1]}`;

        // Get Sydney time
        const sydneyTime = date.toLocaleTimeString('en-US', {
            timeZone: 'Australia/Sydney',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Get day of week for Sydney
        const sydneyDay = date.toLocaleDateString('en-US', {
            timeZone: 'Australia/Sydney',
            weekday: options.weekdayFormat || 'short'
        });

        // Add emojis with YYYY-MM-DD format
        return {
            utc: `🌐 ${utcFormattedDate}, ${utcTime}`,
            sydney: `🦘 ${sydneyFormattedDate}, ${sydneyTime}, ${sydneyDay}`
        };
    } catch (error) {
        console.error('Timezone formatting error:', error);
        return {
            utc: options.errorText || 'Error',
            sydney: options.errorText || 'Error'
        };
    }
};

/**
 * Format date with timezones as a single string
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Combined formatted string
 */
export const formatDateWithTimezonesCombined = (dateString, options = {}) => {
    const times = formatDateWithTimezones(dateString, options);
    return `${times.utc} | ${times.sydney}`;
};