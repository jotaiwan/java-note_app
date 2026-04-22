/**
 * Environment configuration
 * Defines all available environments with their properties
 */

export const ENVIRONMENTS = [
    {
        id: 'prod',
        name: 'Production;',
        color: '#ef4444',  // Red
        description: 'Production Environment',
        apiBaseUrl: '/api/prod',
        isProduction: true
    },
    {
        id: 'rc',
        name: 'RC/Staging',
        color: '#f97316',  // Orange
        description: 'Release Candidate',
        apiBaseUrl: '/api/rc',
        isProduction: false
    },
    {
        id: 'int',
        name: 'INT',
        color: '#3b82f6',  // Blue
        description: 'Development Environment',
        apiBaseUrl: '/api/dev',
        isProduction: false
    },
    {
        id: 'local',
        name: 'Local',
        color: '#10b981',  // Green
        description: 'Local Development',
        apiBaseUrl: '/api',
        isProduction: false
    }
];

/**
 * Get environment by ID
 * @param {string} id - Environment ID
 * @returns {Object|undefined} Environment object
 */
export const getEnvironmentById = (id) => {
    return ENVIRONMENTS.find(env => env.id === id);
};

/**
 * Get default environment
 * @returns {Object} Default environment
 */
export const getDefaultEnvironment = () => {
    return ENVIRONMENTS.find(env => env.id === 'local') || ENVIRONMENTS[0];
};

/**
 * Get environment display name
 * @param {string} id - Environment ID
 * @returns {string} Display name
 */
export const getEnvironmentName = (id) => {
    const env = getEnvironmentById(id);
    return env ? env.name : 'UNKNOWN';
};