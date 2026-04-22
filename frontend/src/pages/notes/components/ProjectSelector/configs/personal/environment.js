/**
 * Environment configuration for Personal
 */

export const ENVIRONMENTS = [
    {
        id: 'personal',
        name: 'Personal',
        color: '#8b5cf6',
        description: 'Personal workspace',
        apiBaseUrl: '/api/personal',
        isProduction: false
    },
    {
        id: 'test',
        name: 'Test',
        color: '#f59e0b',
        description: 'Testing workspace',
        apiBaseUrl: '/api/test',
        isProduction: false
    }
];

export const getEnvironmentById = (id) => {
    return ENVIRONMENTS.find(env => env.id === id);
};

export const getDefaultEnvironment = () => {
    return ENVIRONMENTS.find(env => env.id === 'personal') || ENVIRONMENTS[0];
};

export const getEnvironmentName = (id) => {
    const env = getEnvironmentById(id);
    return env ? env.name : 'UNKNOWN';
};