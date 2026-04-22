/**
 * Environment configuration for Group 1
 */

export const ENVIRONMENTS = [
    {
        id: 'prod',
        name: 'Production',
        color: '#ef4444',
        description: 'Production Environment',
        apiBaseUrl: '/api/prod',
        isProduction: true
    },
    {
        id: 'rc',
        name: 'RC/Staging',
        color: '#f97316',
        description: 'Release Candidate',
        apiBaseUrl: '/api/rc',
        isProduction: false
    },
    {
        id: 'int',
        name: 'INT',
        color: '#3b82f6',
        description: 'Development Environment',
        apiBaseUrl: '/api/dev',
        isProduction: false
    },
    {
        id: 'local',
        name: 'Local',
        color: '#10b981',
        description: 'Local Development',
        apiBaseUrl: '/api',
        isProduction: false
    }
];

/**
 * Get environment by ID
 */
export const getEnvironmentById = (id) => {
    return ENVIRONMENTS.find(env => env.id === id);
};

/**
 * Get default environment for Group 1
 */
export const getDefaultEnvironment = () => {
    return ENVIRONMENTS.find(env => env.id === 'local') || ENVIRONMENTS[0];
};

/**
 * Get environment display name
 */
export const getEnvironmentName = (id) => {
    const env = getEnvironmentById(id);
    return env ? env.name : 'UNKNOWN';
};