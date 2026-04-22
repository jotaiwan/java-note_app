/**
 * Get current datetime in YYYY-mm-dd HH:MM:SS format
 * @returns {string} Formatted datetime string
 */
export const getCurrentDateTimeDisplay = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convert display format to datetime-local format (with T)
 * @param {string} displayDateTime - Date in 'YYYY-mm-dd HH:MM:SS' format
 * @returns {string} Date in 'YYYY-mm-ddTHH:MM' format
 */
export const displayToDateTimeLocal = (displayDateTime) => {
    if (!displayDateTime) return '';
    // Remove seconds and replace space with T
    return displayDateTime.slice(0, 16).replace(' ', 'T');
};

/**
 * Convert datetime-local format to display format (with space)
 * @param {string} dateTimeLocal - Date in 'YYYY-mm-ddTHH:MM' format
 * @returns {string} Date in 'YYYY-mm-dd HH:MM:SS' format
 */
export const dateTimeLocalToDisplay = (dateTimeLocal) => {
    if (!dateTimeLocal) return '';
    // Add seconds and replace T with space
    return dateTimeLocal.replace('T', ' ') + ':00';
};

/**
 * Format datetime for submission
 * @param {string} createdDateTime - Date in display format
 * @returns {string} ISO string
 */
export const formatDateTimeForSubmission = (createdDateTime) => {
    const dateTimeWithT = displayToDateTimeLocal(createdDateTime);
    return new Date(dateTimeWithT).toISOString();
};