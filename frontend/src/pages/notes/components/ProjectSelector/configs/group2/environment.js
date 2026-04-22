/**
 * Environment configuration for Group 2
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
        id: 'staging',
        name: 'Staging',
        color: '#f97316',
        description: 'Staging Environment',
        apiBaseUrl: '/api/staging',
        isProduction: false
    },
    {
        id: 'dev',
        name: 'Development',
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

export const getEnvironmentById = (id) => {
    return ENVIRONMENTS.find(env => env.id === id);
};

export const getDefaultEnvironment = () => {
    return ENVIRONMENTS.find(env => env.id === 'local') || ENVIRONMENTS[0];
};

export const getEnvironmentName = (id) => {
    const env = getEnvironmentById(id);
    return env ? env.name : 'UNKNOWN';
};